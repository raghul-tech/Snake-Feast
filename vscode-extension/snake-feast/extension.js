const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('Snake Feast extension is now active!');
    const disposable = vscode.commands.registerCommand('snake-feast.start', function () {
        vscode.window.showInformationMessage('Starting Snake Feast...');
        const panel = vscode.window.createWebviewPanel(
            'snakeFeast',    
            'Snake Feast 🐍',       
            vscode.ViewColumn.One,  
            {
                enableScripts: true,           
                retainContextWhenHidden: true, 
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'webview'))
                ]
            }
        );

        const indexPath = path.join(context.extensionPath, 'webview', 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            panel.webview.html = `<h1>Error</h1><p>Game files not found at: ${indexPath}</p>`;
            vscode.window.showErrorMessage(`Game files not found! Check if webview/index.html exists`);
            return;
        }
        
        let htmlContent = fs.readFileSync(indexPath, 'utf8');
        
        const webview = panel.webview;
        
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
                htmlContent = htmlContent.replace(
                    new RegExp(`href=["']${path.basename(cssFile)}["']`, 'g'),
                    `href="${uri.toString()}"`
                );
                console.log(`Found CSS: ${cssFile}`);
            } else {
                console.log(`Missing CSS: ${cssFile}`);
            }
        });
        
        const jsFiles = ['js/phaser.min.js', 'js/score.js', 'js/script.js', 'js/scene.js'];
        jsFiles.forEach(jsFile => {
            const uri = getWebviewUri(jsFile);
            if (uri) {
                htmlContent = htmlContent.replace(
                    new RegExp(`src=["']${path.basename(jsFile)}["']`, 'g'),
                    `src="${uri.toString()}"`
                );
                console.log(`Found JS: ${jsFile}`);
            } else {
                console.log(`Missing JS: ${jsFile}`);
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
                           font-src ${webview.cspSource};">
        `;
        
        htmlContent = htmlContent.replace('<head>', '<head>' + csp);
        panel.webview.html = htmlContent;
        panel.onDidDispose(() => {
            console.log('Snake Feast game panel closed');
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};