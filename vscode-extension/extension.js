const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
  const provider = new PetDotsView(context.extensionUri);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('petdots.workspace', provider));
  context.subscriptions.push(vscode.commands.registerCommand('petdots.openWorkspace', () => vscode.commands.executeCommand('workbench.view.extension.petdots')));
}

class PetDotsView {
  constructor(extensionUri) { this.extensionUri = extensionUri; this.panel = null; }
  resolveWebviewView(webviewView) {
    this.panel = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.html(webviewView.webview);
    const eventFile = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd(), '.petdots', 'events.jsonl');
    const send = () => { let text = ''; try { text = fs.readFileSync(eventFile, 'utf8'); } catch (_) {} webviewView.webview.postMessage({ type: 'events', text }); };
    fs.watchFile(eventFile, { interval: 600 }, send); send();
    webviewView.onDidDispose(() => fs.unwatchFile(eventFile, send));
  }
  html(webview) {
    const uri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'panel.html'));
    return `<!doctype html><html><body><iframe title="PetDots" src="${uri}" style="width:100%;height:100%;border:0"></iframe></body></html>`;
  }
}
module.exports = { activate };
