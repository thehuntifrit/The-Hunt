import os
import re

# List of selectors from the previous output
selectors = [
    '#app-sidebar', '#card-overlay-backdrop', '#manual-modal', '#manual-modal-backdrop', '#mobile-footer-bar', 
    '#mobile-layout', '#mobile-top-bar', '#pc-layout', '#pc-left-list', '#pc-right-pane', '#readme-container', 
    '#report-modal', '#sidebar-area-filter', '#sidebar-error-content', '#sidebar-status-bar', '#status-message-telop', 
    '.area-expansion', '.area-filter-btn', '.area-grid', '.area-info-container', '.area-select-all', '.bg-gray-800', 
    '.bg-rank-a', '.bg-rank-f', '.bg-rank-s', '.color-b1', '.color-b1-culled', '.color-b1-only', '.color-b2', 
    '.color-b2-culled', '.color-b2-only', '.color-lastone', '.condition-section-neon', '.condition-text', '.content-area', 
    '.count-at', '.count-num-label', '.count-num-yellow', '.count-prefix-icon', '.custom-tooltip', '.detail-area-row', 
    '.detail-grid', '.detail-info-item', '.detail-label-icon', '.detail-memo-box', '.detail-memo-input', '.detail-percent-val', 
    '.detail-section', '.detail-time-val', '.error-msg', '.error-time', '.expandable-panel', '.flex', '.font-numeric', 
    '.header-clock-group', '.header-label-mini', '.header-time-val-mini', '.instance-label', '.js-mobile-icon', 
    '.js-mobile-time', '.js-mobile-time-inner', '.label', '.label-next', '.list-rank-badge', '.loading-overlay', 
    '.loading-spinner', '.loading-text', '.logo-hunt', '.logo-the', '.magnifier-content-wrapper', '.main-content-area', 
    '.maintenance-box', '.manual-modal-close', '.manual-modal-content', '.manual-modal-header', '.manual-modal-title', 
    '.manual-modal-top-border', '.map-container', '.map-magnifier', '.map-overlay', '.memo-icon-container', '.memo-input', 
    '.mob-card', '.mob-card-header', '.mob-card-inner', '.mob-card-placeholder', '.mob-count-container', '.mob-map-img', 
    '.mob-name', '.mob-rank-badge', '.mobile-clock-label', '.mobile-clock-val', '.mobile-detail-actions', '.mobile-expand-inner', 
    '.mobile-expand-row', '.mobile-footer-btn', '.mobile-footer-icon', '.mobile-footer-icons', '.mobile-footer-label', 
    '.mobile-footer-notify', '.mobile-footer-panel', '.mobile-header-area-text', '.mobile-left-lower', '.mobile-top-clocks', 
    '.mobile-top-title', '.pc-clocks-header', '.pc-detail-card', '.pc-detail-content', '.pc-detail-header', '.pc-detail-name', 
    '.pc-detail-progress-bar', '.pc-detail-progress-container', '.pc-detail-progress-text', '.pc-detail-rank', '.pc-list-count-inner', 
    '.pc-list-item', '.pc-list-name', '.pc-list-percent', '.pc-list-progress-bar', '.pc-list-progress-container', 
    '.pc-list-report-btn', '.pc-list-time', '.pc-percent-inner', '.percent-unit', '.progress-bar-bg', '.progress-bar-wrapper', 
    '.progress-info-group', '.progress-max-over', '.progress-text', '.rank-accordion-item', '.rank-header', '.report-side-bar', 
    '.section-content', '.section-label', '.sidebar-alert-content', '.sidebar-divider', '.sidebar-error-item', '.sidebar-filter-accordion', 
    '.sidebar-filter-title', '.sidebar-icon', '.sidebar-icon-btn', '.sidebar-icon-col', '.sidebar-inner', '.sidebar-label', 
    '.sidebar-logo', '.sidebar-main-nav', '.sidebar-manual-content', '.sidebar-notification-icon', '.sidebar-notification-label', 
    '.sidebar-notification-toggle', '.sidebar-panel', '.sidebar-section', '.sidebar-section-title', '.sidebar-top', '.spawn-point', 
    '.special-timer', '.status-condition-active', '.status-max-over', '.status-next', '.status-pop-window', '.text-cyan', '.text-glow', 
    '.text-gray', '.text-next', '.text-pop', '.text-yellow', '.time-normal', '.time-sep', '.timer-label-base', '.timer-num', 
    '.timer-part', '.timer-unit', '.timer-value', '.truncate', '.value'
]

# Root path
root = r'c:\Users\teamm\The-Hunt'
scan_dirs = [os.path.join(root, 'js'), os.path.join(root, 'index.html')]

files = []
for d in scan_dirs:
    if os.path.isdir(d):
        for f in os.listdir(d):
            if f.endswith('.js'):
                files.append(os.path.join(d, f))
    else:
        files.append(d)

# Read all file contents
contents = ""
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        contents += file.read() + "\n"

# Check each selector
unused = []
for s in selectors:
    raw = s[1:] # remove . or #
    # Search for the raw string in HTML/JS
    # We use regex to ensure it's not a substring of a larger word if possible
    # but for CSS classes, partial matches in templates are common.
    if raw not in contents:
        # Extra check for dynamic usage: 
        # Is it part of a set of known prefixes?
        dynamic_prefixes = ['rank-', 'status-', 'bg-rank-', 'color-']
        is_dynamic = False
        for p in dynamic_prefixes:
            if raw.startswith(p):
                is_dynamic = True
                break
        if not is_dynamic:
            unused.append(s)

print("UNUSED SELECTORS:")
for s in sorted(unused):
    print(s)
