import * as vscode from "vscode";
import * as cp from "child_process";

export function activate(context: vscode.ExtensionContext) {
  // Git extension
  const gitExtension = vscode.extensions.getExtension<{
    getAPI(version: number): any;
  }>("vscode.git")?.exports;

  if (!gitExtension) {
    vscode.window.showErrorMessage("Git extension not found.");
    return;
  }

  const api = gitExtension.getAPI(1);

  // Listen to push events
  api.onDidRunGitCommand(async (e: any) => {
    if (e.command === "push") {
      const repo = e.repository;
      if (!repo) return;

      // Get current branch
      const branch = repo.state.HEAD?.name;
      const remote = repo.state.HEAD?.upstream?.remote;
      if (!branch || !remote) return;

      // Get remote URL
      const remoteUrl = repo.state.remotes.find(
        (r: any) => r.name === remote
      )?.fetchUrl;
      if (!remoteUrl) return;

      // Convert to a clickable web URL if GitHub/GitLab
      let branchUrl = remoteUrl;
      if (branchUrl.endsWith(".git")) {
        branchUrl = branchUrl.slice(0, -4);
      }
      branchUrl += `/tree/${branch}`;

      // Show notification
      vscode.window
        .showInformationMessage(`Pushed to ${remote}/${branch}`, "Open Remote")
        .then((selection) => {
          if (selection === "Open Remote") {
            vscode.env.openExternal(vscode.Uri.parse(branchUrl));
          }
        });
    }
  });
}

//test
export function deactivate() {}
