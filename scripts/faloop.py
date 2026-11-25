import os
import json
import websocket
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# ---------------------------
# パス解決
# ---------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------
# Firebase 初期化
# ---------------------------
# serviceAccountKey.json または service-account.json を探索
SERVICE_ACCOUNT_CANDIDATES = [
    os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", ""),
    os.path.join(BASE_DIR, "serviceAccountKey.json"),
    os.path.join(BASE_DIR, "service-account.json"),
    "serviceAccountKey.json",
    "service-account.json",
]

cred_path = next((p for p in SERVICE_ACCOUNT_CANDIDATES if p and os.path.exists(p)), None)
if cred_path:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    # デフォルト認証（GCP環境等）を試行
    try:
        firebase_admin.initialize_app()
    except Exception as e:
        print(f"Warning: Firebase credentials not found. {e}")

db = firestore.client()

# ---------------------------
# 設定とデータ読み込み
# ---------------------------
TARGET_WORLD = "ifrit"

# mob_data.json を読み込んでランクや名称を特定できるようにする
MOB_DATA = {}
mob_data_candidates = [
    os.path.join(BASE_DIR, "public", "json", "mob_data.json"),
    os.path.join(BASE_DIR, "json", "mob_data.json"),
    "public/json/mob_data.json",
    "json/mob_data.json"
]
for p in mob_data_candidates:
    if os.path.exists(p):
        try:
            with open(p, "r", encoding="utf-8") as f:
                MOB_DATA_ROOT = json.load(f)
                MOB_DATA = MOB_DATA_ROOT.get("mobs", {})
                break
        except Exception as e:
            print(f"Error loading {p}: {e}")

# faloop-mob-map.json があれば全モブ対応マップを自動ロード
FALOOP_MAP_DATA = {}
map_candidates = [
    os.path.join(BASE_DIR, "public", "json", "faloop-mob-map.json"),
    "public/json/faloop-mob-map.json"
]
for p in map_candidates:
    if os.path.exists(p):
        try:
            with open(p, "r", encoding="utf-8") as f:
                FALOOP_MAP_DATA = json.load(f)
                break
        except Exception as e:
            print(f"Error loading {p}: {e}")

# Faloop Mob ID (mobId2: 英語名) -> このサイトの管理番号(No) へのマッピング
# websocket の mobId2 に含まれる小文字の英語名と mob_data.json のキーを対応させます
FALOOP_TO_NO_MAP = {
    # Expansion 3
    "gamma": 32051,
    "okina": 32041,
    "salt and light": 32031,
    "bone crawler": 32021,
    "orghana": 32061,
    "udumbara": 32011,
    
    # Expansion 5
    "sphatika": 52021,
    "burkh": 52011,
    "armstrong": 52031,
    "ruminator": 52041,
    "ophioneus": 52051,
    "narrow-rift": 52061,

    # Expansion 1 (代表的なもの)
    "croque mitaine": 12011,
    "kerogeros": 12021,
    "the garlock": 12031,
    "bonnacon": 12041,
    "nandi": 12051,
    "chernobog": 12061,
}

def save_to_firestore(data):
    # mobId2 (英語名) を優先して取得し、小文字でマッチング
    faloop_mob_id = str(data.get("mobId2") or data.get("mobId")).lower()
    
    # 1. faloop-mob-map.json から取得、なければフォールバック
    mob_no = None
    if faloop_mob_id in FALOOP_MAP_DATA:
        mob_no = FALOOP_MAP_DATA[faloop_mob_id].get("mobNo")
    if not mob_no:
        mob_no = FALOOP_TO_NO_MAP.get(faloop_mob_id)
    
    if not mob_no:
        # マッピングがない場合はスキップ
        print(f"[{datetime.now()}] Mapping not found for: {faloop_mob_id}")
        return

    mob_no_str = str(mob_no)
    mob_info = MOB_DATA.get(mob_no_str, {})
    rank = mob_info.get("r") or mob_info.get("rank") or (FALOOP_MAP_DATA.get(faloop_mob_id, {}).get("rank"))

    # ランクに応じて保存先のドキュメントを決定
    doc_id = "s_latest"
    if rank == "A":
        doc_id = "a_latest"
    elif rank == "F":
        doc_id = "f_latest"
    
    # 討伐時刻 (killedAt) がある場合のみ処理
    killed_at_str = data.get("killedAt")
    if not killed_at_str:
        return

    try:
        # ISO形式の文字列 "2026-04-23T09:14:19.808Z" を datetime に変換
        # 末尾の Z を除去してパース
        dt_str = killed_at_str.replace("Z", "+00:00")
        kill_time = datetime.fromisoformat(dt_str)
    except Exception as e:
        print(f"Error parsing date: {e}")
        return
    
    doc_ref = db.collection("mob_status").document(doc_id)
    
    # The-Hunt の server.js の形式に準拠して保存
    update_payload = {
        mob_no_str: {
            "last_kill_time": kill_time,
            "reporter_id": "faloop_bot",
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    }
    
    try:
        doc_ref.set(update_payload, merge=True)
        print(f"[{datetime.now()}] Firestore save completed: {doc_id}")
    except Exception as e:
        print(f"Error saving to Firestore: {e}")

# ---------------------------
# WebSocket 処理
# ---------------------------
WS_URL = "wss://faloop.app/comms/socket.io/?EIO=4&transport=websocket"

def on_message(ws, message):
    if not message.startswith("42"):
        if message == "2":
            ws.send("3")
        return

    try:
        # インデックス 2 以降を JSON としてパース
        payload = json.loads(message[2:])
    except:
        return

    event_name = payload[0]
    if event_name != "message":
        return

    body = payload[1]
    data = body.get("data", {})

    # worldId / worldId2 を抽出してフィルタリング
    # "worldId2":"ravana" などの文字列で来る場合がある
    world = str(data.get("worldId2") or data.get("id", {}).get("worldId")).lower()

    if world != TARGET_WORLD:
        return

    # Firebase に保存するための整形
    cleaned = {
        "type": body.get("type"),
        "subType": body.get("subType"),
        "mobId": data.get("id", {}).get("mobId"),
        "mobId2": data.get("mobId2"), # 英語名 (e.g. "gamma")
        "killedAt": data.get("killedAt"),
        "action": data.get("action")
    }
    
    # 討伐情報の場合のみ保存
    if cleaned["killedAt"]:
        save_to_firestore(cleaned)

def on_open(ws):
    print("WebSocket opened")

def on_error(ws, error):
    print("Error:", error)

def on_close(ws, code, msg):
    print("WebSocket closed")

if __name__ == "__main__":
    ws = websocket.WebSocketApp(
        WS_URL,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    ws.run_forever()
