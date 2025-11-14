"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const OPEN_IN_BROWSER = "View Branch";
const CREATE_PR = "Create PR";
function activate(_) {
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
        const branch = e.branch ?? null;
        const project = e?.repository?.rootUri?.path.split(/[/\\]/).pop() ?? null;
        const config = vscode.workspace.getConfiguration("vs-links");
        const branchUrlPattern = config.get("branchUrlPattern") || "";
        const prUrlPattern = config.get("prUrlPattern") || "";
        if (!project) {
            vscode.window.showErrorMessage("Could not determine project name from repository.");
            return;
        }
        // Attempt to build URLs from user patterns
        let branchUrl = getBrancUrl(branchUrlPattern, project, branch);
        let prUrl = getPrUrl(prUrlPattern, project, branch);
        const options = [];
        if (branchUrl) {
            options.push(OPEN_IN_BROWSER);
        }
        if (prUrl) {
            options.push(CREATE_PR);
        }
        vscode.window
            .showInformationMessage(`Pushed to ${branchUrl}`, ...options)
            .then((selection) => {
            if (selection === OPEN_IN_BROWSER && branchUrl) {
                vscode.env.openExternal(vscode.Uri.parse(branchUrl));
            }
            else if (selection === CREATE_PR && prUrl) {
                vscode.env.openExternal(vscode.Uri.parse(prUrl));
            }
        });
    });
}
function deactivate() { }
function getBrancUrl(pattern, project, branch) {
    if (!pattern)
        return null;
    try {
        const url = pattern
            .replace("${project}", encodeURIComponent(project))
            .replace("${branch}", encodeURIComponent(branch));
        return url;
    }
    catch (error) {
        vscode.window.showWarningMessage("Branch URL pattern did not match. Please check your configuration." +
            error);
        return null;
    }
}
function getPrUrl(pattern, project, branch) {
    if (!pattern)
        return null;
    try {
        const url = pattern
            .replace("${project}", encodeURIComponent(project))
            .replace("${branch}", encodeURIComponent(branch));
        return url;
    }
    catch (error) {
        vscode.window.showWarningMessage("PR URL pattern did not match. Please check your configuration." + error);
        return null;
    }
}
//# sourceMappingURL=extension.js.map