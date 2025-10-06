// Google Apps Script (GAS) のエンドポイントURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxyutpOIZYI9Ce51s4vawk6S460QgM4wYcaLFJKUBi00_LKhNXT9-6N0n178KdoXkP7wg/exec';

// --- データ定義 ---
const MOCK_MOB_DATA = [
     {"No.": 11011,"Rank": "A","Name": "醜男のヴォガージャ","Area": "中央ラノシア","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11021,"Rank": "A","Name": "ウンクテヒ","Area": "低地ラノシア","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11031,"Rank": "A","Name": "魔導ヘルズクロー","Area": "東ラノシア","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11041,"Rank": "A","Name": "ナン","Area": "西ラノシア","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11051,"Rank": "A","Name": "マーベリー","Area": "高地ラノシア","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 18000,"Map": ""},
     {"No.": 11061,"Rank": "A","Name": "コンヌ","Area": "外地ラノシア","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11071,"Rank": "A","Name": "ファルネウス","Area": "中央森林","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11081,"Rank": "A","Name": "メルティゼリー","Area": "東部森林","POP_Date": "","REPOP(s)": 10800,"MAX(s)": 14400,"Map": ""},
     {"No.": 11091,"Rank": "A","Name": "ゲーデ","Area": "南部森林","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11101,"Rank": "A","Name": "ギルタブ","Area": "北部森林","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 18000,"Map": ""},
     {"No.": 11111,"Rank": "A","Name": "アレクトリオン","Area": "中央ザナラーン","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11121,"Rank": "A","Name": "サボテンダー・バイラリーナ","Area": "西ザナラーン","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 18000,"Map": ""},
     {"No.": 11131,"Rank": "A","Name": "マヘス","Area": "東ザナラーン","POP_Date": "","REPOP(s)": 10800,"MAX(s)": 14400,"Map": ""},
     {"No.": 11141,"Rank": "A","Name": "ザニゴ","Area": "南ザナラーン","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 11151,"Rank": "A","Name": "ファイナルフレイム","Area": "北ザナラーン","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 18000,"Map": ""},
     {"No.": 11161,"Rank": "A","Name": "マラク","Area": "クルザス中央高地","POP_Date": "","REPOP(s)": 10800,"MAX(s)": 14400,"Map": ""},
     {"No.": 11171,"Rank": "A","Name": "クーレア","Area": "モードゥナ","POP_Date": "","REPOP(s)": 12600,"MAX(s)": 16200,"Map": ""},
     {"No.": 12011,"Rank": "S","Name": "クロック・ミテーヌ","Area": "中央ラノシア","POP_Date": "「ラノシアンソイルG3を」採掘 (抽選)//※ET 19:00～21:59","REPOP(s)": 234000,"MAX(s)": 270000,"Map": ""},
     {"No.": 12021,"Rank": "S","Name": "ケロゲロス","Area": "低地ラノシア","POP_Date": "満月直前のET17:00にPOP地点を踏む//※以降は満月中のET 17:00～3:00","REPOP(s)": 180000,"MAX(s)": 180000,"Map": ""},
     {"No.": 12031,"Rank": "S","Name": "ガーロック","Area": "東ラノシア","POP_Date": "LT 3時間20分 (200分間) 雨が降らない","REPOP(s)": 151200,"MAX(s)": 172800,"Map": ""},
     {"No.": 12041,"Rank": "S","Name": "ボナコン","Area": "西ラノシア","POP_Date": "「ラノシアリーキ」を採集 (抽選)//※ET 8:00～10:59","REPOP(s)": 234000,"MAX(s)": 270000,"Map": ""},
     {"No.": 12051,"Rank": "S","Name": "ナンディ","Area": "高地ラノシア","POP_Date": "ミニオンを出してPOP地点を踏む","REPOP(s)": 169200,"MAX(s)": 190800,"Map": "Upper_La_Noscea.webp","spawn_points": [{  "id": "UN_01",  "x": 33.5,  "y": 8.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_02",  "x": 47.9,  "y": 10.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_03",  "x": 43.3,  "y": 17.5,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_04",  "x": 51.5,  "y": 20.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_05",  "x": 50.5,  "y": 33.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_06",  "x": 12.8,  "y": 20.9,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_07",  "x": 24.3,  "y": 58.1,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_08",  "x": 33.9,  "y": 65.7,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_09",  "x": 26.1,  "y": 67.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_10",  "x": 32.7,  "y": 70.5,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_11",  "x": 23.3,  "y": 81.1,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_12",  "x": 26.4,  "y": 92.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_13",  "x": 36.4,  "y": 82.3,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_14",  "x": 42.6,  "y": 90.3,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_15",  "x": 61.4,  "y": 92.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_16",  "x": 62.2,  "y": 82.9,  "mob_ranks": ["S", "A", "B1"] },{  "id": "UN_17",  "x": 74.4,  "y": 79.9,  "mob_ranks": ["S", "A", "B1"] } ]},
     {"No.": 12061,"Rank": "S","Name": "チェルノボーグ","Area": "外地ラノシア","POP_Date": "プレイヤーが戦闘不能になる (抽選)","REPOP(s)": 234000,"MAX(s)": 255600,"Map": ""},
     {"No.": 12071,"Rank": "S","Name": "レドロネット","Area": "中央森林","POP_Date": "LT 30分間、雨が降り続く","REPOP(s)": 151200,"MAX(s)": 172800,"Map": ""},
     {"No.": 12081,"Rank": "S","Name": "ウルガル","Area": "東部森林","POP_Date": "傭兵 or 双蛇党リーヴを開始する (抽選)","REPOP(s)": 241200,"MAX(s)": 280800,"Map": ""},
     {"No.": 12091,"Rank": "S","Name": "マインドフレア","Area": "南部森林","POP_Date": "新月のET0:00以降の夜間にPOP地点を踏む//※以降は新月中のET 17:00～2:59","REPOP(s)": 180000,"MAX(s)": 180000,"Map": ""},
     {"No.": 12101,"Rank": "S","Name": "サウザンドキャスト・セダ","Area": "北部森林","POP_Date": "フォールゴウド秋瓜湖畔で「ジャッジレイ」を釣り上げる (抽選) //※ET 17:00～20:59 餌: フェザントフライ","REPOP(s)": 205200,"MAX(s)": 230400,"Map": ""},
     {"No.": 12111,"Rank": "S","Name": "ゾーナ・シーカー","Area": "西ザナラーン","POP_Date": "ノフィカの井戸で銅鏡を釣り上げる(抽選)//※「晴れ or 快晴」 餌: バターワーム","REPOP(s)": 205200,"MAX(s)": 230400,"Map": ""},
     {"No.": 12121,"Rank": "S","Name": "ブロンテス","Area": "中央ザナラーン","POP_Date": "POP地点で食事を食べる","REPOP(s)": 241200,"MAX(s)": 277200,"Map": "Central_Thanalan.webp","spawn_points": [{  "id": "CT_01",  "x": 56.4,  "y": 92.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_02",  "x": 52.0,  "y": 77.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_03",  "x": 57.1,  "y": 81.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_04",  "x": 64.8,  "y": 72.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_05",  "x": 44.4,  "y": 57.8,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_06",  "x": 37.4,  "y": 55.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_07",  "x": 39.4,  "y": 49.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_08",  "x": 38.0,  "y": 41.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_09",  "x": 28.8,  "y": 47.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_10",  "x": 48.6,  "y": 37.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_11",  "x": 28.0,  "y": 32.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_12",  "x": 34.4,  "y": 29.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_13",  "x": 35.4,  "y": 25.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_14",  "x": 29.2,  "y": 20.8,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_15",  "x": 28.2,  "y": 5.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_16",  "x": 35.0,  "y": 10.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_17",  "x": 49.2,  "y": 10.2,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_18",  "x": 48.6,  "y": 18.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_19",  "x": 45.0,  "y": 20.2,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_20",  "x": 63.2,  "y": 26.6,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_21",  "x": 71.0,  "y": 27.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_22",  "x": 77.8,  "y": 38.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CT_23",  "x": 69.2,  "y": 39.8,  "mob_ranks": ["S", "A", "B1"] } ]},
     {"No.": 12131,"Rank": "S","Name": "バルウール","Area": "東ザナラーン","POP_Date": "傭兵 or 不滅隊リーヴを開始する (抽選)","REPOP(s)": 241200,"MAX(s)": 280800,"Map": ""},
     {"No.": 12141,"Rank": "S","Name": "ヌニュヌウィ","Area": "南ザナラーン","POP_Date": "エリア全域のFATEを1時間失敗させない","REPOP(s)": 158400,"MAX(s)": 194400,"Map": ""},
     {"No.": 12151,"Rank": "S","Name": "ミニョーカオン","Area": "北ザナラーン","POP_Date": "「アーススプライト」100体討伐","REPOP(s)": 205200,"MAX(s)": 226800,"Map": ""},
     {"No.": 12161,"Rank": "S","Name": "サファト","Area": "クルザス中央高地","POP_Date": "高所から落下してHPが1になる (抽選)","REPOP(s)": 216000,"MAX(s)": 302400,"Map": ""},
     {"No.": 12171,"Rank": "S","Name": "アグリッパ","Area": "モードゥナ","POP_Date": "モードゥナの宝の地図を開ける (抽選)//古ぼけた地図G5 / 隠された地図G1 / 謎めいた地図","REPOP(s)": 216000,"MAX(s)": 302400,"Map": ""},
     {"No.": 13011,"Rank": "F","Name": "古の闘神「オーディン」","Area": "黒衣森全域","POP_Date": "","REPOP(s)": 86400,"MAX(s)": 259200,"Map": ""},
     {"No.": 13021,"Rank": "F","Name": "手負いの魔獣「ベヒーモス」","Area": "クルザス中央高地","POP_Date": "","REPOP(s)": 86400,"MAX(s)": 259200,"Map": ""},
     {"No.": 21011,"Rank": "A","Name": "ミルカ","Area": "クルザス西部高地","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21021,"Rank": "A","Name": "リューバ","Area": "クルザス西部高地","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21031,"Rank": "A","Name": "エンケドラス","Area": "アバラシア雲海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21041,"Rank": "A","Name": "シシウトゥル","Area": "アバラシア雲海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21051,"Rank": "A","Name": "ブネ","Area": "ドラヴァニア雲海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21061,"Rank": "A","Name": "アガトス","Area": "ドラヴァニア雲海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21071,"Rank": "A","Name": "パイルラスタ","Area": "高地ドラヴァニア","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21081,"Rank": "A","Name": "ワイバーンロード","Area": "高地ドラヴァニア","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21091,"Rank": "A","Name": "機兵のスリップキンクス","Area": "低地ドラヴァニア","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21101,"Rank": "A","Name": "ストラス","Area": "低地ドラヴァニア","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21111,"Rank": "A","Name": "キャムパクティ","Area": "アジス・ラー","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 21121,"Rank": "A","Name": "センチブロッサム","Area": "アジス・ラー","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 22011,"Rank": "S","Name": "カイザーベヒーモス","Area": "クルザス西部高地","POP Date": "ミニオン「ロイヤルベビーモス」を連れてPOP地点を踏む","REPOP(s)": 302400,"MAX(s)": 475200,"Map": "Coerthas_Western_Highlands.webp","spawn_points": [{  "id": "CW_01",  "x": 56.4,  "y": 92.4,  "mob_ranks": ["B1"] },{  "id": "CW_02",  "x": 52.0,  "y": 77.4,  "mob_ranks": ["B2"] },{  "id": "CW_03",  "x": 57.1,  "y": 81.0,  "mob_ranks": ["B2"] },{  "id": "CW_04",  "x": 64.8,  "y": 72.6,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_05",  "x": 44.4,  "y": 57.8,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_06",  "x": 37.4,  "y": 55.6,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_07",  "x": 39.4,  "y": 49.0,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_08",  "x": 38.0,  "y": 41.6,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_09",  "x": 28.8,  "y": 47.0,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_10",  "x": 48.6,  "y": 37.0,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_11",  "x": 28.0,  "y": 32.6,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_12",  "x": 34.4,  "y": 29.6,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_13",  "x": 40.0,  "y": 29.0,  "mob_ranks": ["S", "A", "B2"] },{  "id": "CW_14",  "x": 62.8,  "y": 14.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_15",  "x": 80.2,  "y": 19.0,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_16",  "x": 82.8,  "y": 27.2,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_17",  "x": 66.8,  "y": 27.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_18",  "x": 58.2,  "y": 24.4,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_19",  "x": 61.6,  "y": 34.2,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_20",  "x": 73.6,  "y": 37.8,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_21",  "x": 77.6,  "y": 45.2,  "mob_ranks": ["S", "A", "B1"] },{  "id": "CW_22",  "x": 77.8,  "y": 50.6,  "mob_ranks": ["B1"] },{  "id": "CW_23",  "x": 63.0,  "y": 47.6,  "mob_ranks": ["B1"] },{  "id": "CW_24",  "x": 68.0,  "y": 59.0,  "mob_ranks": ["B1"] } ]},
     {"No.": 22021,"Rank": "S","Name": "極楽鳥","Area": "アバラシア雲海","POP_Date": "Bモブ「スクオンク」の「チャープ」発動時 (抽選)","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 22031,"Rank": "S","Name": "ガンダルヴァ","Area": "ドラヴァニア雲海","POP_Date": "「皇金鉱 (ET 2:00～3:59 / 14:00～15:59)」//「アストラルフラワー (ET 4:00～5:59 / 16:00～17:59)」を各50回採集","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 22041,"Rank": "S","Name": "セーンムルウ","Area": "高地ドラヴァニア","POP_Date": "FATE「卵をめぐる竜の戦争」を5回連続でコンプリートする","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 22051,"Rank": "S","Name": "ペイルライダー","Area": "低地ドラヴァニア","POP_Date": "低地ドラの「宝の地図G7 (古ぼけた地図G7)」の宝箱を開ける (抽選)","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 22061,"Rank": "S","Name": "レウクロッタ","Area": "アジス・ラー","POP_Date": "「メラシディアン・ヴィーヴル」「レッサーハイドラ」//「アラガン・キマイラ」各50体討伐","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 23011,"Rank": "F","Name": "幻影の女王「クァールレギナ」","Area": "高地ドラヴァニア","POP_Date": "","REPOP(s)": 86400,"MAX(s)": 172800,"Map": ""},
     {"No.": 23021,"Rank": "F","Name": "太古の脅威：ノクチルカ撃滅戦","Area": "アジス・ラー","POP_Date": "","REPOP(s)": 86400,"MAX(s)": 172800,"Map": ""},
     {"No.": 31011,"Rank": "A","Name": "オルクス","Area": "ギラバニア辺境地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31021,"Rank": "A","Name": "アール","Area": "ギラバニア辺境地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31031,"Rank": "A","Name": "バックスタイン","Area": "ギラバニア山岳地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31041,"Rank": "A","Name": "アクラブアメル","Area": "ギラバニア山岳地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31051,"Rank": "A","Name": "マヒシャ","Area": "ギラバニア湖畔地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31061,"Rank": "A","Name": "ルミナーレ","Area": "ギラバニア湖畔地帯","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31071,"Rank": "A","Name": "船幽霊","Area": "紅玉海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31081,"Rank": "A","Name": "オニユメミ","Area": "紅玉海","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31091,"Rank": "A","Name": "ガジャースラ","Area": "ヤンサ","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31101,"Rank": "A","Name": "アンガダ","Area": "ヤンサ","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31111,"Rank": "A","Name": "ギリメカラ","Area": "アジムステップ","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 31121,"Rank": "A","Name": "ソム","Area": "アジムステップ","POP_Date": "","REPOP(s)": 14400,"MAX(s)": 21600,"Map": ""},
     {"No.": 32011,"Rank": "S","Name": "ウドンゲ","Area": "ギラバニア辺境地帯","POP_Date": "「レーシー」「ディアッカ」各100体討伐","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 32021,"Rank": "S","Name": "ボーンクローラー","Area": "ギラバニア山岳地帯","POP_Date": "チョコボポーターで南北境界線を通過//※アラガーナ⇔アラギリが最適","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 32031,"Rank": "S","Name": "ソルト・アンド・ライト","Area": "ギラバニア湖畔地帯","POP_Date": "ギラバニア湖畔地帯でアイテムを50回捨てる","REPOP(s)": 302400,"MAX(s)": 475200,"Map": ""},
     {"No.": 32041,"Rank": "S","Name": "オキナ","Area": "紅玉海","POP_Date": "「ユメミガイ」「カラナシユメミ」各100体討伐後、満月になる//※満月中に討伐数を満たすのも可...
];
// (※MOCK_MOB_DATAは省略されていますが、元のデータが全て含まれます。)

// --- グローバル変数 ---
let globalMobData = [];
let currentFilter = 'ALL';
let currentMobNo = null;
let userId = null;

// --- DOMエレメント ---
const appEl = document.getElementById('app');
const mobListContainer = document.getElementById('mob-list-container');
const rankTabs = document.getElementById('rank-tabs');
const reportModal = document.getElementById('report-modal');
const modalMobName = document.getElementById('modal-mob-name');
const reportDatetimeInput = document.getElementById('report-datetime');
const reportMemoInput = document.getElementById('report-memo');
const submitReportBtn = document.getElementById('submit-report');
const cancelReportBtn = document.getElementById('cancel-report');
const reportStatusEl = document.getElementById('report-status');

// --- ユーティリティ関数 ---

/**
 * UNIX秒 (サーバー時間) を Dateオブジェクトに変換する
 * @param {number} unixtime - UNIX秒 (秒単位)
 * @returns {Date}
 */
function unixTimeToDate(unixtime) {
    // JavaScriptのDateはミリ秒単位で処理するため、1000倍する
    return new Date(unixtime * 1000); 
}

/**
 * 討伐日時からリポップ情報を計算する
 * @param {object} mob - モブデータオブジェクト (REPOP(s), MAX(s)を含む)
 * @param {string | Date} lastKill - 最終討伐日時 (文字列 or Dateオブジェクト)
 * @returns {object} { minRepop: Date | string, maxRepop: Date, timeRemaining: string, elapsedPercent: number }
 */
function calculateRepop(mob, lastKill) {
    if (!lastKill) {
        return {
            minRepop: '未討伐',
            maxRepop: null,
            timeRemaining: 'N/A',
            elapsedPercent: 0
        };
    }

    const killTime = (lastKill instanceof Date) ? lastKill : new Date(lastKill);
    const now = new Date();

    // 最小/最大リポップ時間（ミリ秒）
    const repopMinMs = mob['REPOP(s)'] * 1000;
    const repopMaxMs = mob['MAX(s)'] * 1000;

    const minRepopTime = new Date(killTime.getTime() + repopMinMs);
    const maxRepopTime = new Date(killTime.getTime() + repopMaxMs);

    // 経過時間と残りの時間（ミリ秒）
    const elapsedMs = now.getTime() - killTime.getTime();
    const remainingMs = minRepopTime.getTime() - now.getTime();
    
    // 進捗パーセント
    const totalDurationMs = repopMaxMs; 
    let elapsedPercent = (elapsedMs / totalDurationMs) * 100;
    
    // 経過率を最小ポップ時間で正規化して表示（0% - 100%）
    // 最小ポップ時間を超えたら100%になるように調整
    let normalizedElapsedPercent = Math.max(0, Math.min(100, (elapsedMs / repopMinMs) * 100));


    // 残り時間のフォーマット
    let timeRemainingStr;
    if (remainingMs <= 0) {
        timeRemainingStr = 'POP中';
        // POP中の場合は進捗を最小時間で計算した100%または、最大時間までの実際の進捗に留める
        elapsedPercent = Math.max(100, Math.min(100, (elapsedMs / repopMaxMs) * 100));
        normalizedElapsedPercent = 100;

    } else {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        timeRemainingStr = `${hours}h ${minutes}m ${seconds}s`;
    }

    return {
        minRepop: minRepopTime,
        maxRepop: maxRepopTime,
        timeRemaining: timeRemainingStr,
        elapsedPercent: normalizedElapsedPercent // 進捗バー表示に使う
    };
}

/**
 * モブデータに基づいてHTMLカードを生成する
 * @param {object} mob - モブデータオブジェクト
 * @returns {string} - HTML文字列
 */
function createMobCard(mob) {
    const { minRepop, timeRemaining, elapsedPercent } = calculateRepop(mob, mob.POP_Date);

    // 進捗バーの色定義
    let colorStart = '#10b981'; // green-500
    let colorEnd = '#34d399';   // green-400
    let timeStatusClass = 'text-green-400';
    let minPopStr = '未討伐';

    if (mob.POP_Date) {
        minPopStr = minRepop instanceof Date ? minRepop.toLocaleString() : minRepop;

        if (timeRemaining === 'POP中') {
            colorStart = '#f59e0b'; // amber-500
            colorEnd = '#fbbf24';   // amber-400
            timeStatusClass = 'text-amber-400 font-bold';
        } else if (elapsedPercent >= 90) {
            colorStart = '#ef4444'; // red-500
            colorEnd = '#f87171';   // red-400
            timeStatusClass = 'text-red-400';
        }
    }

    // ランクアイコンの背景色
    let rankBgClass;
    let rankTextColor = 'text-white';
    switch (mob.Rank) {
        case 'S':
            rankBgClass = 'bg-red-600';
            break;
        case 'A':
            rankBgClass = 'bg-blue-600';
            break;
        case 'B': // Bモブがあれば
            rankBgClass = 'bg-gray-600';
            break;
        case 'F':
            rankBgClass = 'bg-purple-600';
            break;
        default:
            rankBgClass = 'bg-gray-600';
    }

    // 討伐報告ボタンの初期状態
    const isPop = timeRemaining === 'POP中';
    const reportBtnClass = isPop ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 report-btn';
    const reportBtnText = isPop ? 'POP中 (報告不可)' : '討伐報告';
    
    // マップ詳細表示トグルボタン
    const toggleMapBtn = mob.Map ? `
        <button class="toggle-details-btn text-xs font-semibold py-1 px-2 rounded-full bg-gray-600 hover:bg-gray-500">
            マップ詳細
        </button>
    ` : '';

    return `
        <div class="mob-card bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-300 relative" 
             data-rank="${mob.Rank}" 
             data-mobno="${mob['No.']}"
             data-lastkill="${mob.POP_Date || ''}"
             data-minrepop="${mob['REPOP(s)']}"
             data-maxrepop="${mob['MAX(s)']}">

            <div class="repop-bar-bg absolute top-0 left-0 h-1 w-full"
                 style="--progress-percent: ${elapsedPercent.toFixed(1)}%; 
                        --progress-color-start: ${colorStart}; 
                        --progress-color-end: ${colorEnd};">
            </div>

            <div class="p-4 fixed-content">
                <div class="flex justify-between items-center mb-2">
                    <div class="rank-icon ${rankBgClass} ${rankTextColor} font-bold text-xs w-8 h-8 flex items-center justify-center rounded-full shadow-lg">
                        ${mob.Rank}
                    </div>
                    
                    <button class="${reportBtnClass} text-xs text-white px-3 py-1 rounded-full shadow-md transition" 
                            data-mobno="${mob['No.']}" 
                            ${isPop ? 'disabled' : ''}>
                        ${reportBtnText}
                    </button>
                </div>

                <h2 class="text-xl font-bold text-outline text-yellow-200">${mob.Name}</h2>
                <p class="text-sm text-gray-400">${mob.Area}</p>

                <div class="mt-3 bg-gray-700 p-2 rounded-lg text-xs">
                    <p class="text-gray-300">最終討伐: <span class="last-kill-date">${mob.POP_Date || 'N/A'}</span></p>
                    <p class="font-bold">
                        予測POP: <span class="repop-time text-base ${timeStatusClass}">${minPopStr}</span>
                    </p>
                    <p class="text-gray-300">
                        残/経過: <span class="font-mono time-remaining">${timeRemaining} (${elapsedPercent.toFixed(1)}%)</span>
                    </p>
                </div>

                <div class="mt-3 flex justify-between items-center">
                    <p class="text-xs text-gray-400">${mob.POP_Date}</p>
                    ${toggleMapBtn}
                </div>
            </div>

            <div class="mob-details border-t border-gray-700 bg-gray-900" 
                 id="details-${mob['No.']}">
                ${mob.Map ? `
                    <div class="relative mt-2 p-2">
                        <img src="./maps/${mob.Map}" alt="${mob.Area} Map" class="w-full h-auto rounded-lg shadow-md map-image" data-area="${mob.Area}">
                        <div class="absolute inset-0 map-overlay" data-area="${mob.Area}">
                            </div>
                    </div>
                ` : '<p class="text-sm text-gray-500 italic">マップデータなし</p>'}
            </div>
        </div>
    `;
}

/**
 * MobNoからモブデータを取得する
 * @param {number} mobNo 
 * @returns {object}
 */
function getMobByNo(mobNo) {
    return globalMobData.find(mob => mob['No.'] === mobNo);
}

// --- DOM操作/イベントハンドラ ---

/**
 * フィルターに基づいてモブカードリストをレンダリングする
 * @param {string} rank - フィルターするランク ('ALL', 'S', 'A', 'F')
 */
function renderMobList(rank) {
    currentFilter = rank;
    mobListContainer.innerHTML = ''; 

    // フィルタリング
    const filteredMobs = rank === 'ALL' 
        ? globalMobData
        : globalMobData.filter(mob => mob.Rank === rank);

    // 既存のコンテンツを保持しつつ、新しいカードを各カラムに均等に配置
    const columns = [
        document.getElementById('column-1'),
        document.getElementById('column-2'),
        document.getElementById('column-3')
    ].filter(col => col); // null除外（モバイル時）

    columns.forEach(col => col.innerHTML = ''); // カラムをクリア

    filteredMobs.forEach((mob, index) => {
        const cardHtml = createMobCard(mob);
        
        // 振り分けロジック: デスクトップ(3カラム)またはモバイル(1カラム)
        let targetColumn = columns[0];
        if (columns.length > 1) {
            targetColumn = columns[index % columns.length];
        }

        const div = document.createElement('div');
        div.innerHTML = cardHtml.trim();
        targetColumn.appendChild(div.firstChild);
    });

    // アクティブなタブをハイライト
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
        if (btn.dataset.rank === rank) {
            btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
        }
    });
    
    // イベントリスナーを再設定
    attachEventListeners();
}

/**
 * イベントリスナーをカードとボタンにアタッチする
 */
function attachEventListeners() {
    // 討伐報告ボタン
    document.querySelectorAll('.report-btn').forEach(button => {
        button.onclick = (e) => openReportModal(e.currentTarget.dataset.mobno);
    });
    
    // マップ詳細トグルボタン
    document.querySelectorAll('.toggle-details-btn').forEach(button => {
        button.onclick = (e) => toggleMobDetails(e.currentTarget);
    });
}

/**
 * マップ詳細パネルの表示/非表示を切り替える
 * @param {HTMLElement} button - クリックされたボタン要素
 */
function toggleMobDetails(button) {
    const card = button.closest('.mob-card');
    const mobNo = card.dataset.mobno;
    const detailsPanel = document.getElementById(`details-${mobNo}`);
    const mob = getMobByNo(parseInt(mobNo));

    if (detailsPanel.classList.contains('open')) {
        // パネルを閉じる
        detailsPanel.classList.remove('open');
        button.textContent = 'マップ詳細';
    } else {
        // パネルを開く
        detailsPanel.classList.add('open');
        button.textContent = '詳細を隠す';
        
        // マップオーバーレイが空の場合は描画
        const mapOverlay = detailsPanel.querySelector('.map-overlay');
        if (mapOverlay && mapOverlay.children.length === 0 && mob.spawn_points) {
            drawSpawnPoints(mapOverlay, mob.spawn_points, mobNo);
        }
    }
}

/**
 * マップにスポーンポイントを描画する
 * @param {HTMLElement} overlayEl - マップオーバーレイ要素
 * @param {Array<object>} spawnPoints - スポーンポイントの座標配列
 * @param {string} currentMobNo - 現在表示しているモブのNo
 */
function drawSpawnPoints(overlayEl, spawnPoints, currentMobNo) {
    overlayEl.innerHTML = '';
    
    // 湧き潰し対象のモブランクを取得 (Sモブの湧き潰しはAモブの場合がある)
    const mob = getMobByNo(parseInt(currentMobNo));
    
    spawnPoints.forEach(point => {
        // 現在のモブが出現する可能性のあるポイントのみを重要とマーク
        // (例: 南ディのSランクと、湧き潰し対象のAランク/Bランクの場所)
        const isImportant = point.mob_ranks.includes(mob.Rank); 
        
        // 座標計算 (0-100%スケール)
        const xPercent = point.x;
        const yPercent = point.y;
        
        const pointEl = document.createElement('div');
        pointEl.className = 'spawn-point';
        pointEl.setAttribute('data-id', point.id);
        pointEl.setAttribute('data-important', isImportant ? 'true' : 'false');
        
        // Sランクモブの湧き潰しポイントは特別なリングを表示（湧き潰し中かどうかを示すために使用可能）
        if (isImportant && mob.Rank === 'S') {
            // Sランクポイントはリングを表示
            pointEl.classList.add('important-ring');
            // JSでインラインスタイルとしてSモブの色付きシャドウを付与
            pointEl.style.boxShadow = '0 0 0 4px #f59e0b'; // 例: アンバーのリング
            pointEl.style.filter = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))';
        } else if (isImportant && mob.Rank === 'A') {
            // Aランクモブはシンプルな青い点
            pointEl.style.backgroundColor = '#3b82f6'; // blue-500
        } else {
            // 通常のBモブ湧き潰し地点など、非重要な点
            pointEl.style.backgroundColor = '#9ca3af'; // gray-400
            pointEl.style.opacity = '0.4';
        }

        pointEl.style.left = `${xPercent}%`;
        pointEl.style.top = `${yPercent}%`;
        
        // 湧き潰しポイントクリックイベント (例: 湧き潰し完了を記録)
        if (isImportant) {
            pointEl.onclick = () => {
                alert(`ポイント [${point.id}] をクリックしました。湧き潰し機能は未実装です。`);
                // 実際のアプリケーションでは、ここでサーバーに湧き潰し完了を報告するAPIを叩く
            };
        }
        
        overlayEl.appendChild(pointEl);
    });
}

// --- モーダル/フォーム操作 ---

/**
 * 討伐報告モーダルを開く
 * @param {number} mobNo - 報告対象のモブNo
 */
function openReportModal(mobNo) {
    currentMobNo = parseInt(mobNo);
    const mob = getMobByNo(currentMobNo);
    
    if (!mob) return;

    modalMobName.textContent = mob.Name;
    reportMemoInput.value = '';
    reportStatusEl.textContent = '';
    reportStatusEl.classList.add('hidden');

    // 現在時刻をローカルタイムでセット
    const now = new Date();
    // UTCからタイムゾーンオフセットを考慮した文字列を生成
    const offset = now.getTimezoneOffset() * 60000;
    const localIso = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    reportDatetimeInput.value = localIso;

    reportModal.classList.remove('hidden');
    reportModal.classList.add('flex');
}

/**
 * 討伐報告モーダルを閉じる
 */
function closeReportModal() {
    reportModal.classList.add('hidden');
    reportModal.classList.remove('flex');
    currentMobNo = null;
}

/**
 * 討伐報告をGASに送信する
 */
async function submitReport() {
    if (!currentMobNo) return;

    const killTime = reportDatetimeInput.value;
    const memo = reportMemoInput.value;
    const mob = getMobByNo(currentMobNo);

    if (!killTime) {
        alert('討伐日時を入力してください。');
        return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = '送信中...';
    reportStatusEl.classList.remove('hidden');
    reportStatusEl.classList.remove('text-green-500', 'text-red-500');
    reportStatusEl.textContent = 'サーバーに送信中...';
    
    // ISO 8601形式の文字列をDateオブジェクトに変換（この段階でローカルタイムとして解釈される）
    const killDate = new Date(killTime); 

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors', // CORSを許可
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // GASウェブアプリのパラメータとしてデータを送信
            body: new URLSearchParams({
                action: 'reportKill',
                mobNo: currentMobNo,
                mobName: mob.Name,
                killTime: killDate.toISOString(), // UTCで送信
                memo: memo,
                reporterId: userId // 報告者UUID
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            reportStatusEl.textContent = `報告成功！ (${result.message})`;
            reportStatusEl.classList.add('text-green-500');
            // 最新のデータでリストを更新
            await fetchRecordsAndUpdate(); 
            // 成功したらモーダルを閉じる
            setTimeout(closeReportModal, 1500); 

        } else {
            reportStatusEl.textContent = `報告失敗: ${result.message}`;
            reportStatusEl.classList.add('text-red-500');
        }

    } catch (error) {
        console.error('報告エラー:', error);
        reportStatusEl.textContent = '通信エラーが発生しました。';
        reportStatusEl.classList.add('text-red-500');
    } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.textContent = '報告完了';
    }
}

// --- データ取得/更新 ---

/**
 * GASから最新の討伐記録を取得し、グローバルデータを更新する
 */
async function fetchRecordsAndUpdate() {
    try {
        const response = await fetch(GAS_ENDPOINT + '?action=getRecords');
        const data = await response.json();
        
        if (data.status === 'success') {
            const records = data.records;
            
            // MOCK_MOB_DATAをコピーして最新の討伐日時をマージ
            globalMobData = MOCK_MOB_DATA.map(mob => {
                const record = records.find(r => r['No.'] === mob['No.']);
                if (record && record.POP_Date_Unix) {
                    // Unix秒をDateオブジェクトに変換
                    mob.POP_Date = unixTimeToDate(record.POP_Date_Unix).toLocaleString();
                }
                return mob;
            });

            // リストを再レンダリング
            renderMobList(currentFilter);
        } else {
            console.error('GASからのデータ取得失敗:', data.message);
            // エラー時もモックデータで表示
            globalMobData = MOCK_MOB_DATA;
            renderMobList(currentFilter);
        }
    } catch (error) {
        console.error('GAS通信エラー:', error);
        // エラー時もモックデータで表示
        globalMobData = MOCK_MOB_DATA;
        renderMobList(currentFilter);
    }
}

/**
 * 各モブカードの進捗バーを更新する
 */
function updateProgressBars() {
    document.querySelectorAll('.mob-card').forEach(card => {
        const lastKillStr = card.dataset.lastkill;
        const repop = parseInt(card.dataset.minrepop);
        const max = parseInt(card.dataset.maxrepop);
        
        const lastKill = lastKillStr ? new Date(lastKillStr) : null;
        
        // POP_Dateがない、またはPOP中のモブは更新不要
        if (!lastKill || card.querySelector('.time-remaining').textContent === 'POP中') {
            // POP中のモブでも、最大ポップ時間を過ぎていないかチェックして更新が必要
            // ここでは簡易的に、再計算が必要なロジックを呼ぶ
        }

        // POP_Dateが未設定の場合はスキップ
        if (!lastKill) return; 

        // calculateRepopを使って新しい進捗を計算
        const mobStub = {"REPOP(s)": repop, "MAX(s)": max};
        const repopData = calculateRepop(mobStub, lastKill);
        const percent = Math.max(0, Math.min(100, repopData.elapsedPercent || 0));

        // CSS変数とテキストコンテンツを更新
        card.style.setProperty('--progress-percent', `${percent}%`);
        const infoEl = card.querySelector('.fixed-content .font-mono');
        
        if (infoEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            infoEl.textContent = `${repopData.timeRemaining} (${percent.toFixed(1)}%)`;
        }

        // 予測POP時刻の更新（時刻が変わる可能性があるため）
        const repopTimeEl = card.querySelector('.repop-time');
        if (repopTimeEl) {
            const minPopStr = repopData.minRepop instanceof Date ? repopData.minRepop.toLocaleString() : repopData.minRepop;
            repopTimeEl.textContent = minPopStr;
            
            // POP中になった場合、討伐報告ボタンの状態を更新
            const reportBtn = card.querySelector('.report-btn');
            if (repopData.timeRemaining === 'POP中' && reportBtn && !reportBtn.disabled) {
                // POP中になった場合、ボタンを無効化
                reportBtn.disabled = true;
                reportBtn.textContent = 'POP中 (報告不可)';
                reportBtn.classList.remove('bg-green-600', 'hover:bg-green-500', 'active:bg-green-700');
                reportBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
                
                // POP中になったモブをリストの先頭に移動させるなどのソート処理をここで行うことも可能ですが、
                // リストレンダリング全体を再実行（renderMobList）するのが最も確実です。
            }
        }
    });
}

/**
 * サイトの初期化処理
 */
function initializeApp() {
    // 報告者UUIDの生成または取得
    userId = localStorage.getItem('user_uuid');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('user_uuid', userId);
    }

    // イベントリスナー設定
    rankTabs.querySelectorAll('.tab-btn').forEach(button => {
        button.onclick = (e) => renderMobList(e.currentTarget.dataset.rank);
    });
    cancelReportBtn.onclick = closeReportModal;
    submitReportBtn.onclick = submitReport;

    // モーダルの外側クリックで閉じる
    reportModal.addEventListener('click', (e) => {
        if (e.target.id === 'report-modal') {
            closeReportModal();
        }
    });
    
    // 初期表示: GASからデータを取得し、グローバルデータをセット
    fetchRecordsAndUpdate();

    // GASへのデータ更新間隔は10分を維持
    setInterval(fetchRecordsAndUpdate, 10 * 60 * 1000);

    // 進捗ゲージはクライアントで軽量に更新（60秒ごと）
    const __progressUpdaterId = setInterval(updateProgressBars, 60 * 1000);

    // ウィンドウサイズ変更時にもレンダリングを調整する処理を検討...
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', initializeApp);
