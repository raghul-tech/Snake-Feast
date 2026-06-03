import sys
import os
import json

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
from PyQt5.QtCore import QUrl, Qt, QObject, pyqtSlot
from PyQt5.QtGui import QIcon, QColor
from utils import DESKTOP_JS

SCORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scores.json")


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
        self.setWindowTitle("Snake Feast")
        self.setStyleSheet("QMainWindow { background: #000; }")
        screen = QApplication.primaryScreen().availableGeometry()
        sw, sh = screen.width(), screen.height()
        w = max(900,  int(sw * 0.90))
        h = max(650,  int(sh * 0.90))
        x = (sw - w) // 2
        y = (sh - h) // 2
        self.setGeometry(x, y, w, h)

        icon = os.path.join(os.path.dirname(__file__), "icon", "snakelogo.ico")
        if os.path.exists(icon):
            self.setWindowIcon(QIcon(icon))

        self.view = QWebEngineView()
        self.view.page().setBackgroundColor(QColor("#000000"))

        s = self.view.settings()
        s.setAttribute(QWebEngineSettings.JavascriptEnabled,           True)
        s.setAttribute(QWebEngineSettings.LocalStorageEnabled,         True)
        s.setAttribute(QWebEngineSettings.WebGLEnabled,                True)
        s.setAttribute(QWebEngineSettings.Accelerated2dCanvasEnabled,  True)
        s.setAttribute(QWebEngineSettings.AllowRunningInsecureContent, True)
        s.setAttribute(QWebEngineSettings.FullScreenSupportEnabled,    True)

        for name in ["LocalContentCanAccessFileUrls",
                     "LocalContentCanAccessLocalUrls"]:
            attr = getattr(QWebEngineSettings, name, None)
            if attr:
                s.setAttribute(attr, True)
                break
        for name in ["LocalContentCanAccessRemoteUrls"]:
            attr = getattr(QWebEngineSettings, name, None)
            if attr:
                s.setAttribute(attr, True)

        profile = QWebEngineProfile.defaultProfile()
        profile.setHttpCacheType(QWebEngineProfile.NoCache)

        self.bridge  = ScoreBridge()
        self.channel = QWebChannel()
        self.channel.registerObject("pyBridge", self.bridge)
        self.view.page().setWebChannel(self.channel)

        base   = os.path.dirname(os.path.abspath(__file__))
        parent = os.path.dirname(base)
        index  = os.path.join(parent, "web", "index.html")
        if not os.path.exists(index):
            sys.exit(1)

        self.view.setUrl(QUrl.fromLocalFile(index))
        self.setCentralWidget(self.view)
        self.view.loadFinished.connect(self._on_load)

    def _on_load(self, ok):
        """Runs after the page loads. Injects desktop fixes."""
        if not ok:
            return
        self.view.setZoomFactor(1.0)
        self.view.page().runJavaScript(DESKTOP_JS)

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
    app.setApplicationName("Snake Feast")
    w = MainWindow()
    w.show()
    sys.exit(app.exec_())