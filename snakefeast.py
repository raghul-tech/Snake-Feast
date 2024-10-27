import sys
import os
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings
from PyQt5.QtCore import QUrl
from PyQt5.QtGui import QIcon

class GameWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Snake Feast")
        self.setGeometry(0, 0, 1400, 970)  # Set window size
        self.setWindowIcon(QIcon(os.path.join(os.path.dirname(__file__), "img","snakelogo.ico")))  # Use relative path for icon

        # Create a QWebEngineView to display the HTML content
        self.browser = QWebEngineView()
 # Adjust settings for better performance
      #  self.browser.settings().setAttribute(QWebEngineSettings.AutoLoadImages, True)
       # self.browser.settings().setAttribute(QWebEngineSettings.JavascriptEnabled, True)
        #self.browser.settings().setAttribute(QWebEngineSettings.FullScreenSupportEnabled, True)

        self.setCentralWidget(self.browser)

        # Load the HTML file
        self.browser.setUrl(QUrl.fromLocalFile(os.path.join(os.path.dirname(__file__), "index.html")))  # Use relative path

if __name__ == "__main__":
    app = QApplication(sys.argv)
    #app.setWindowIcon(QIcon(os.path.join(os.path.dirname(__file__), "img","snakelogo.ico")))  # Update to your icon file path
    window = GameWindow()
    window.show()
    sys.exit(app.exec_())