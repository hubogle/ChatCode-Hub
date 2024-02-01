import { EventEmitter } from "events";
import { storeGlobals, storeStatus } from './globals';
import { UserLogin } from "./server/user";

import * as vscode from "vscode";

export class Manager extends EventEmitter {
    private account: string | undefined;
    private token: string | undefined;
    private address: string | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        super();
        this.loadUserInfo();
    }

    private saveUserInfo() {
        storeGlobals(this.address, this.token, this.account);
        this.context.globalState.update('account', this.account);
        this.context.globalState.update('token', this.token);
        this.context.globalState.update('address', this.address);
    }


    private loadUserInfo() {
        this.account = this.context.globalState.get('account');
        this.token = this.context.globalState.get('token');
        this.address = this.context.globalState.get('address');
        storeGlobals(this.address, this.token, this.account);
        if (this.token) {
            storeStatus(true)
            vscode.commands.executeCommand('chatcode-hub.ws');
        }
    }

    private clearUserInfo() {
        this.context.globalState.update('account', undefined);
        this.context.globalState.update('token', undefined);
        this.context.globalState.update('address', undefined);
        storeGlobals(undefined, undefined, undefined);
        storeStatus(false)
    }


    public async login(): Promise<void> {
        try {
            const address = await vscode.window.showInputBox({
                prompt: "Please enter your host",
                placeHolder: "host",
                value: "localhost:8080",
                validateInput: (text) => {
                    return text === "" ? "Please enter your host" : null;
                },
            });

            const username = await vscode.window.showInputBox({
                prompt: "Please enter your username",
                placeHolder: "username",
                validateInput: (text) => {
                    return text === "" ? "Please enter your username" : null;
                },
            });

            const password = await vscode.window.showInputBox({
                prompt: "Please enter your password",
                placeHolder: "password",
                validateInput: (text) => {
                    return text === "" ? "Please enter your password" : null;
                },
            });

            try {
                const token = await UserLogin(address, username, password)
                vscode.window.showInformationMessage(`Successfully login as ${username}`);
                this.account = username;
                this.token = token;
                this.address = address;
                storeStatus(true)
                vscode.commands.executeCommand('chatcode-hub.refresh');
                vscode.commands.executeCommand('chatcode-hub.ws');
                this.saveUserInfo();
                this.emit("statusChanged");
            } catch (error) {
                console.error('An error occurred:', error);
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async logout(): Promise<void> {
        vscode.window.showInformationMessage(`Successfully logout as ${this.account}`);
        this.clearUserInfo();
        vscode.commands.executeCommand('chatcode-hub.refresh');
        this.emit("statusChanged");
    }
}
