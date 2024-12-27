import sys
import os
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtCore import pyqtSlot, QObject, QUrl, Qt
from PyQt5.QtGui import QIcon

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Snake Feast")
        self.setGeometry(100, 100, 1400, 970)
        self.setWindowIcon(QIcon(os.path.join(os.path.dirname(__file__), "img", "snakelogo.ico")))

        # Create a QWebEngineView to load the HTML
        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)

        # Load the main HTML file
        html_path = os.path.join(os.path.dirname(__file__), "index.html")
        self.browser.setUrl(QUrl.fromLocalFile(html_path))


if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    main_window.show()
    sys.exit(app.exec_())
