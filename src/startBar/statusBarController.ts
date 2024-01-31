import * as vscode from "vscode";
import { UserStatus } from "../constants";

class StatusBarController implements vscode.Disposable {
    private statusBar: StatusBarItem;

    constructor() {
        this.statusBar = new StatusBarItem();

    }
    public dispose(): void {
    }
}

export class StatusBarItem implements vscode.Disposable {
    private readonly statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem();
        this.statusBarItem.command = "leetcode.manageSessions";
    }

    public update(status: UserStatus, user?: string) {
        switch (status) {
            case UserStatus.Login:
                this.statusBarItem.text = `Chat Code: ${user}`;
                break;
            case UserStatus.Logout:
            default:
                this.statusBarItem.text = "";
                break;
        }
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}


export const statusBarController: StatusBarController = new StatusBarController();
