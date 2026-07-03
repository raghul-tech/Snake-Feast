import sys
import os
import json
import ctypes
import tempfile

os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = " ".join([
    "--disable-web-security",
    "--allow-file-access-from-files",
    "--enable-webgl",
    "--use-gl=swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-accelerated-2d-canvas",
    "--force-color-profile=srgb",
    "--disable-color-correct-rendering",
])
os.environ["QTWEBENGINE_DISABLE_SANDBOX"] = "1"

from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings, QWebEngineProfile
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtCore import QUrl, Qt, QObject, pyqtSlot, QTimer
from PyQt5.QtGui import QIcon, QColor, QPalette
from utils import DESKTOP_JS

DESIGN_WIDTH = 1920
DESIGN_HEIGHT = 1080
EDGE_MARGIN = 20
APP_NAME = "Snake Feast"
APP_FOLDER = "SnakeFeast"


def get_data_dir():
    """Get writable data directory for app storage."""
 
    base_paths = []
    
    if sys.platform == "win32":
        base_paths.append(os.environ.get("APPDATA", ""))
        base_paths.append(os.environ.get("LOCALAPPDATA", ""))
    elif sys.platform == "darwin":
        base_paths.append(os.path.join(os.path.expanduser("~"), "Library", "Application Support"))
    else:
        base_paths.append(os.environ.get("XDG_DATA_HOME", 
                         os.path.join(os.path.expanduser("~"), ".local", "share")))

    for base in base_paths:
        if base:
            path = os.path.join(base, APP_FOLDER)
            try:
                os.makedirs(path, exist_ok=True)
                return path
            except Exception:
                continue
    
    fallbacks = [
        os.path.join(os.path.expanduser("~"), APP_FOLDER),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), APP_FOLDER),
        os.path.join(tempfile.gettempdir(), APP_FOLDER),
        os.getcwd()
    ]
    
    for path in fallbacks:
        try:
            os.makedirs(path, exist_ok=True)
            return path
        except Exception:
            continue
    
    raise RuntimeError("Cannot find writable directory")

try:
    DATA_DIR = get_data_dir()
except RuntimeError:
    DATA_DIR = os.getcwd()

SCORE_FILE = os.path.join(DATA_DIR, "scores.json")
WINDOW_FILE = os.path.join(DATA_DIR, "window.json")


def load_scores():
    """Read scores from file. Returns dict with easy/medium/hard keys."""

    if os.path.exists(SCORE_FILE):
        try:
            with open(SCORE_FILE, "r") as f:
                data = json.load(f)
                return {
                    "easy":   int(data.get("easy",   0)),
                    "medium": int(data.get("medium", 0)),
                    "hard":   int(data.get("hard",   0)),
                }
        except Exception:
            pass
    return {"easy": 0, "medium": 0, "hard": 0}


def save_scores(scores: dict):
    """Write scores dict to file."""

    try:
        with open(SCORE_FILE, "w") as f:
            json.dump(scores, f, indent=2)
    except Exception:
        pass

def load_window_state():
    """Load window state from file."""

    if os.path.exists(WINDOW_FILE):
        try:
            with open(WINDOW_FILE) as f:
                d = json.load(f)
            return {k: int(d[k]) for k in ("x", "y", "w", "h")} | {"maximised": bool(d.get("maximised", False))}
        except Exception:
            pass
    return None


def save_window_state(x, y, w, h, maximised):
    """Save window state to file."""

    try:
        with open(WINDOW_FILE, "w") as f:
            json.dump({"x": x, "y": y, "w": w, "h": h, "maximised": maximised}, f, indent=2)
    except Exception:
        pass

def clamp_to_screen(x, y, w, h, geo):
    """Clamp window position and size to screen bounds."""

    sx, sy, sw, sh = geo.x(), geo.y(), geo.width(), geo.height()
    title_bar_visible = (
        x >= sx - w + 100 and
        x <= sx + sw - 100 and
        y >= sy and
        y <= sy + sh - 50
    )
    if not title_bar_visible:
        w = min(w, sw - 2 * EDGE_MARGIN)
        h = min(h, sh - 2 * EDGE_MARGIN)
        x = sx + (sw - w) // 2
        y = sy + (sh - h) // 2
    else:
        w = min(w, sw - 2 * EDGE_MARGIN)
        h = min(h, sh - 2 * EDGE_MARGIN)
    x = max(sx + EDGE_MARGIN, min(x, sx + sw - w - EDGE_MARGIN))
    y = max(sy + EDGE_MARGIN, min(y, sy + sh - h - EDGE_MARGIN))
    return x, y, w, h


def default_geometry(geo):
    """Calculate default window geometry based on screen size."""

    sw, sh = geo.width(), geo.height()
    w = max(900, min(int(sw * 0.85), sw - 2 * EDGE_MARGIN))
    h = max(650, min(int(sh * 0.85), sh - 2 * EDGE_MARGIN))
    w = min(w, sw - 2 * EDGE_MARGIN)
    h = min(h, sh - 2 * EDGE_MARGIN)
    x = geo.x() + (sw - w) // 2
    y = geo.y() + (sh - h) // 2
    x = max(geo.x() + EDGE_MARGIN, min(x, geo.x() + sw - w - EDGE_MARGIN))
    y = max(geo.y() + EDGE_MARGIN, min(y, geo.y() + sh - h - EDGE_MARGIN))
    zoom = max(0.5, min(1.0, min(sw / DESIGN_WIDTH, sh / DESIGN_HEIGHT)))
    return x, y, w, h, zoom


def apply_dark_titlebar(hwnd):
    """Apply dark title bar to window on Windows."""

    if sys.platform == "win32":
        try:
            dwmapi = ctypes.windll.dwmapi
            DARK = ctypes.c_int(1)
            for attr in (20, 19):
                try:
                    dwmapi.DwmSetWindowAttribute(hwnd, attr, ctypes.byref(DARK), ctypes.sizeof(DARK))
                except Exception:
                    pass
        except Exception:
            pass


class ScoreBridge(QObject):
    """
    Exposed to JavaScript as window.pyBridge.
    JS calls:
        window.pyBridge.getScores()          → returns JSON string of all scores
        window.pyBridge.saveScore(mode, val) → saves one score
    """

    @pyqtSlot(result=str)
    def getScores(self):
        """Return all high scores as a JSON string."""

        return json.dumps(load_scores())

    @pyqtSlot(str, int)
    def saveScore(self, mode: str, value: int):
        """Save a single mode's high score if it beats the current best."""

        if mode not in ("easy", "medium", "hard"):
            return
        scores = load_scores()
        if value > scores.get(mode, 0):
            scores[mode] = value
            save_scores(scores)


class MainWindow(QMainWindow):
    def __init__(self):
        """
        Initialize the main window for the Snake Feast game.
        Sets up the window properties, icon, and web view.
        """

        super().__init__()
        self.setWindowTitle(APP_NAME)
        self._setup_ui()
        self._setup_webview()
        self._restore_or_set_geometry()
    
    def _setup_ui(self):
        """Set up the user interface with dark theme and window properties."""

        dark = QPalette()
        colors = {
            QPalette.Window: "#0d0d0d",
            QPalette.WindowText: "#e0e0e0",
            QPalette.Base: "#0d0d0d",
            QPalette.AlternateBase: "#1a1a1a",
            QPalette.ToolTipBase: "#0d0d0d",
            QPalette.ToolTipText: "#e0e0e0",
            QPalette.Text: "#e0e0e0",
            QPalette.Button: "#1a1a1a",
            QPalette.ButtonText: "#e0e0e0",
            QPalette.Highlight: "#39ff14",
            QPalette.HighlightedText: "#000000",
        }
        for role, color in colors.items():
            dark.setColor(role, QColor(color))
        self.setPalette(dark)
        self.setStyleSheet("QMainWindow { background: #000; }")
        icon = os.path.join(os.path.dirname(__file__), "icon", "snakelogo.ico")
        if os.path.exists(icon):
            self.setWindowIcon(QIcon(icon))
    
    def _setup_webview(self):
        """Set up the web view for the game."""

        self.view = QWebEngineView()
        self.view.page().setBackgroundColor(QColor("#000000"))
        self.view.setVisible(False)
        s = self.view.settings()
        attrs = [
            QWebEngineSettings.JavascriptEnabled,
            QWebEngineSettings.LocalStorageEnabled,
            QWebEngineSettings.WebGLEnabled,
            QWebEngineSettings.Accelerated2dCanvasEnabled,
            QWebEngineSettings.AllowRunningInsecureContent,
            QWebEngineSettings.FullScreenSupportEnabled,
        ]
        for attr in attrs:
            s.setAttribute(attr, True)
        
        for name in ["LocalContentCanAccessFileUrls", "LocalContentCanAccessLocalUrls"]:
            if hasattr(QWebEngineSettings, name):
                s.setAttribute(getattr(QWebEngineSettings, name), True)
        
        QWebEngineProfile.defaultProfile().setHttpCacheType(QWebEngineProfile.NoCache)
        

        self.bridge = ScoreBridge()
        self.channel = QWebChannel()
        self.channel.registerObject("pyBridge", self.bridge)
        self.view.page().setWebChannel(self.channel)

        index = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web", "index.html")
        if not os.path.exists(index):
            sys.exit(1)

        self.view.setUrl(QUrl.fromLocalFile(index))
        self.setCentralWidget(self.view)
        self.view.loadFinished.connect(self._on_load)
    
    def _restore_or_set_geometry(self):
        """Restore window geometry from saved state or set default."""

        screen = QApplication.primaryScreen()
        geo = screen.availableGeometry()
        saved = load_window_state()
        if saved:
            x, y, w, h = clamp_to_screen(
                saved["x"], saved["y"], saved["w"], saved["h"], geo
            )
            sw, sh = geo.width(), geo.height()
            self._zoom = max(0.5, min(1.0, min(sw / DESIGN_WIDTH, sh / DESIGN_HEIGHT)))
            self._start_maximised = saved.get("maximised", False)
        else:
            x, y, w, h, self._zoom = default_geometry(geo)
            self._start_maximised = False
        self.setGeometry(x, y, w, h)
    
    def showEvent(self, event):
        """Handle window show event."""

        super().showEvent(event)
        apply_dark_titlebar(int(self.winId()))
        if self._start_maximised:
            self.showMaximized()
            self._start_maximised = False
    
    def _on_load(self, ok):
        """Handle page load completion."""

        if ok:
            self.view.setZoomFactor(self._zoom)
            self.view.page().runJavaScript(DESKTOP_JS)
            QTimer.singleShot(80, lambda: self.view.setVisible(True))
        else:
            self.view.setVisible(True)
    
    def closeEvent(self, event):
        """Handle window close event."""
        
        if self.isMaximized():
            ng = self.normalGeometry()
            save_window_state(ng.x(), ng.y(), ng.width(), ng.height(), True)
        else:
            g = self.geometry()
            save_window_state(g.x(), g.y(), g.width(), g.height(), False)
        super().closeEvent(event)
    
    def keyPressEvent(self, e):
        """
        Handle key press events.
        Blocks zoom shortcuts at the Qt level (backup to the JS handler).
        Toggles fullscreen with F11.
        """

        if (e.modifiers() == Qt.ControlModifier and
                e.key() in (Qt.Key_Plus, Qt.Key_Minus,
                            Qt.Key_Equal, Qt.Key_0)):
            return

        if e.key() == Qt.Key_F11:
            self.showNormal() if self.isFullScreen() else self.showFullScreen()
        elif e.key() == Qt.Key_Escape and self.isFullScreen():
            self.showNormal()
        else:
            super().keyPressEvent(e)


if __name__ == "__main__":
    """Main entry point."""

    try:
        QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
        QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps,    True)
    except AttributeError:
        pass

    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    w = MainWindow()
    w.show()
    sys.exit(app.exec_())