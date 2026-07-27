const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    const disposable = vscode.commands.registerCommand('snake-feast.start', function () {
        vscode.window.showInformationMessage('Starting Snake Feast...');
        const panel = vscode.window.createWebviewPanel(
            'snakeFeast',
            'Snake Feast',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'webview'))
                ]
            }
        );
        const iconPath = path.join(context.extensionPath, 'webview', 'icon', '48.png');
        panel.iconPath = vscode.Uri.file(iconPath);

        const indexPath = path.join(context.extensionPath, 'webview', 'index.html');

        if (!fs.existsSync(indexPath)) {
            panel.webview.html = `<h1>Error</h1><p>Game files not found at: ${indexPath}</p>`;
            vscode.window.showErrorMessage(`Game files not found! Check if webview/index.html exists`);
            return;
        }

        let htmlContent = fs.readFileSync(indexPath, 'utf8');
        const webview = panel.webview;

        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function getWebviewUri(relativePath) {
            const filePath = path.join(context.extensionPath, 'webview', relativePath);
            if (fs.existsSync(filePath)) {
                return webview.asWebviewUri(vscode.Uri.file(filePath));
            }
            return null;
        }

        const cssFiles = ['css/googlefonts.css', 'css/style.css'];
        cssFiles.forEach(cssFile => {
            const uri = getWebviewUri(cssFile);
            if (uri) {
                const htmlPath = cssFile.split(path.sep).join('/');
                htmlContent = htmlContent.replace(
                    new RegExp(`href=["']${escapeRegex(htmlPath)}["']`, 'g'),
                    `href="${uri.toString()}"`
                );
            } else {
                vscode.window.showErrorMessage(`Missing UI file: ${cssFile}`);
            }
        });

        const jsFiles = ['js/sound.js','js/phaser.min.js', 'js/script.js', 'js/scene.js'];
        jsFiles.forEach(jsFile => {
            const uri = getWebviewUri(jsFile);
            if (uri) {
                const htmlPath = jsFile.split(path.sep).join('/');
                htmlContent = htmlContent.replace(
                    new RegExp(`src=["']${escapeRegex(htmlPath)}["']`, 'g'),
                    `src="${uri.toString()}"`
                    );
            } else {
                vscode.window.showErrorMessage(`Missing game file: ${jsFile}`);
            }
        });
        const iconUri = getWebviewUri('icon/48.png');
        if (iconUri) {
            htmlContent = htmlContent.replace(/icon\/48\.png/g, iconUri.toString());
        }
const csp = `
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   style-src ${webview.cspSource} 'unsafe-inline'; 
                   script-src 'unsafe-inline' 'unsafe-eval' ${webview.cspSource}; 
                   img-src ${webview.cspSource} data:; 
                   font-src ${webview.cspSource};
                   media-src 'none';">
`;
        htmlContent = htmlContent.replace('<head>', '<head>' + csp);

        panel.webview.html = htmlContent;
        panel.webview.onDidReceiveMessage(message => {
    switch (message.command) {
        case 'getState':
            panel.webview.postMessage({
                command: 'stateLoaded',
                state: {
                    hs: {
                        easy:   context.globalState.get('sfHs_easy',   0),
                        medium: context.globalState.get('sfHs_medium', 0),
                        hard:   context.globalState.get('sfHs_hard',   0),
                    },
                    unlocked:   context.globalState.get('sfUnlocked', []),
                    soundMuted: context.globalState.get('sfMuted', false),
                }
            });
            break;
        case 'saveHs':
            context.globalState.update('sfHs_' + message.mode, message.value);
            break;
        case 'saveMuted':
            context.globalState.update('sfMuted', message.value);
            break;
        case 'resetHS':
            context.globalState.update('sfHs_' + message.mode, 0);
            panel.webview.postMessage({
                command: 'stateLoaded',
                state: {
                    hs: {
                        easy:   context.globalState.get('sfHs_easy',   0),
                        medium: context.globalState.get('sfHs_medium', 0),
                        hard:   context.globalState.get('sfHs_hard',   0),
                    },
                    unlocked:   context.globalState.get('sfUnlocked', []),
                    soundMuted: context.globalState.get('sfMuted', false),
                }
            });
            break;
    }
}, undefined, context.subscriptions);

        panel.onDidDispose(() => {
            vscode.window.showInformationMessage('Snake Feast game panel closed');
        });
    });

    context.subscriptions.push(disposable);
    const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right, 100
);
statusBar.text = '🐍 Snake Feast';
statusBar.tooltip = 'Click to play Snake Feast';
statusBar.command = 'snake-feast.start';
statusBar.show();
context.subscriptions.push(statusBar);
}

function deactivate() {}

module.exports = { activate, deactivate };