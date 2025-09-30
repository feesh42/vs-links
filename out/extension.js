"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    console.log('Extension "git-push-open-remote" is active!');
    const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
    if (!gitExtension) {
        vscode.window.showErrorMessage("Git extension not found.");
        return;
    }
    const api = gitExtension.getAPI(1);
    // Listen for push events
    api.onDidPublish((e) => {
        console.log("Detected git push event:", e);
        const repo = e.repository;
        if (!repo)
            return;
        const branch = e.branch || repo.state.HEAD?.name;
        const remoteName = repo.state.HEAD?.upstream?.remote;
        if (!branch || !remoteName)
            return;
        let remoteUrl = repo.state.remotes.find((r) => r.name === remoteName)?.fetchUrl;
        if (!remoteUrl)
            return;
        // Normalize SSH → HTTPS
        if (remoteUrl.startsWith("git@")) {
            remoteUrl = remoteUrl.replace("git@", "https://").replace(":", "/");
        }
        if (remoteUrl.endsWith(".git")) {
            remoteUrl = remoteUrl.slice(0, -4);
        }
        // Build branch URL for known hosts
        let branchUrl = remoteUrl;
        if (/github\.com|gitlab\.com|bitbucket\.org/.test(remoteUrl)) {
            branchUrl += `/tree/${branch}`;
        }
        vscode.window
            .showInformationMessage(`Pushed to ${remoteName}/${branch}`, "Open Remote")
            .then((selection) => {
            if (selection === "Open Remote") {
                vscode.env.openExternal(vscode.Uri.parse(branchUrl));
            }
        });
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map