import json

DESKTOP_CSS = """
    html, body {
        -webkit-font-smoothing: antialiased !important;
        text-rendering: optimizeLegibility !important;
    }
    .card {
        gap: 26px !important;
        padding: 38px 34px !important;
        max-height: 90vh !important;
        line-height: 2.6 !important;
    }
    .game-title {
        font-size: 36px !important;
        letter-spacing: 5px !important;
        line-height: 1.2 !important;
    }
    .sub {
        font-size: 13px !important;
        letter-spacing: 4px !important;
        margin-top: -6px !important;
        line-height: 1.5 !important;
    }
    .pills {
        gap: 10px !important;
        padding: 6px !important;
    }
    .pill {
        padding: 10px 22px !important;
        font-size: 13px !important;
        letter-spacing: 1.5px !important;
        line-height: 1.4 !important;
    }
    .hud-lbl {
        font-size: 9px !important;
        letter-spacing: 2.5px !important;
        line-height: 1.5 !important;
    }
    .hud-val {
        font-size: 22px !important;
        line-height: 1.2 !important;
    }
    #hud-mode {
        font-size: 10px !important;
        letter-spacing: 2.5px !important;
        padding: 4px 14px !important;
        line-height: 1.4 !important;
    }
    #btn-reset-hs {
        font-size: 10px !important;
        padding: 5px 12px !important;
        line-height: 1.4 !important;
    }
    #btn-pause {
        width: 36px !important;
        height: 36px !important;
        font-size: 15px !important;
    }
    .color-row {
        gap: 14px !important;
    }
    .color-lbl {
        font-size: 12px !important;
        letter-spacing: 2.5px !important;
        line-height: 1.5 !important;
    }
    .cdots {
        gap: 12px !important;
    }
    .cdot {
        width: 28px !important;
        height: 28px !important;
    }
    .btn-start {
        padding: 20px 0 !important;
        font-size: 16px !important;
        letter-spacing: 2.5px !important;
        gap: 6px !important;
        line-height: 1.4 !important;
    }
    .btn-start small {
        font-size: 11px !important;
        line-height: 1.6 !important;
        letter-spacing: 1.5px !important;
    }
    .btn-menu {
        padding: 11px 24px !important;
        font-size: 13px !important;
        letter-spacing: 1px !important;
        line-height: 1.4 !important;
    }
    .legend {
        gap: 14px !important;
        row-gap: 12px !important;
    }
    .leg {
        font-size: 12px !important;
        gap: 8px !important;
        line-height: 1.6 !important;
    }
    .legdot {
        width: 10px !important;
        height: 10px !important;
        flex-shrink: 0 !important;
    }
    .go-label {
        font-size: 14px !important;
        letter-spacing: 5px !important;
        line-height: 1.5 !important;
    }
    .go-score {
        line-height: 1.15 !important;
        margin-bottom: 2px !important;
    }
    .go-pts {
        font-size: 12px !important;
        letter-spacing: 4px !important;
        margin-top: 4px !important;
        line-height: 1.5 !important;
    }
    .go-hs {
        font-size: 14px !important;
        line-height: 1.6 !important;
    }
    .go-cause {
        font-size: 12px !important;
        line-height: 1.6 !important;
        min-height: 18px !important;
    }
    #t-name {
        font-size: 13px !important;
        line-height: 1.5 !important;
        letter-spacing: 1.5px !important;
    }
    #t-desc {
        font-size: 11px !important;
        margin-top: 3px !important;
        line-height: 1.5 !important;
    }
"""

# ── JS injected after load ─────────────────────────────────────────────────────
DESKTOP_JS = """
(function() {
    // 1. Inject spacing CSS patch
    var style = document.createElement('style');
    style.id  = 'desktop-patch';
    style.textContent = %s;
    document.head.appendChild(style);

    // 2. Block Ctrl+scroll zoom
    window.addEventListener('wheel', function(e) {
        if (e.ctrlKey) { e.preventDefault(); e.stopPropagation(); }
    }, { passive: false, capture: true });

    // 3. Block Ctrl+plus / minus / 0 keyboard zoom
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (
            e.key === '+' || e.key === '-' ||
            e.key === '=' || e.key === '0' ||
            e.code === 'NumpadAdd' ||
            e.code === 'NumpadSubtract'
        )) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { capture: true });

    // 4. Block pinch-zoom gestures (touch/trackpad)
    document.addEventListener('gesturestart',  function(e) { e.preventDefault(); });
    document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
    document.addEventListener('gestureend',    function(e) { e.preventDefault(); });
})();
""" % json.dumps(DESKTOP_CSS)