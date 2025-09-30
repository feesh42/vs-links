import * as vscode from "vscode";

export function activate(_: vscode.ExtensionContext) {
  const gitExtension = vscode.extensions.getExtension<{
    getAPI(version: number): any;
  }>("vscode.git")?.exports;

  if (!gitExtension) {
    vscode.window.showErrorMessage("Git extension not found.");
    return;
  }

  const api = gitExtension.getAPI(1);

  api.onDidRunGitCommand(async (e: any) => {
    if (e.command === "push") {
      const repo = e.repository;
      if (!repo) return;

      const branch = repo.state.HEAD?.name;
      const remote = repo.state.HEAD?.upstream?.remote;
      if (!branch || !remote) return;

      let remoteUrl: string | undefined = repo.state.remotes.find(
        (r: any) => r.name === remote
      )?.fetchUrl;
      if (!remoteUrl) return;

      // Normalize URL
      if (remoteUrl.startsWith("git@")) {
        // Convert SSH → HTTPS (GitHub/GitLab/Bitbucket)
        remoteUrl = remoteUrl.replace("git@", "https://").replace(":", "/");
      }
      if (remoteUrl.endsWith(".git")) {
        remoteUrl = remoteUrl.slice(0, -4);
      }

      // Try to build branch URL (only for known hosts)
      let branchUrl = remoteUrl;
      if (/github\.com|gitlab\.com|bitbucket\.org/.test(remoteUrl)) {
        branchUrl += `/tree/${branch}`;
      }

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

export function deactivate() {}
