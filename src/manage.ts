
import { EventEmitter } from "events";
import { sendPostRequest } from './utils/httpUtils';

import * as vscode from "vscode";

class Manager extends EventEmitter {
    private account: string | undefined;
    private token: string | undefined;

    constructor() {
        super();
        this.account = undefined;
    }

    public async login(): Promise<void> {
        try {
            const host = await vscode.window.showInputBox({
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

            let data;
            try {
                const url = `http://${host}/api/v1/login`;
                data = await sendPostRequest(url, username, password);
                vscode.window.showInformationMessage(`Successfully login as ${username}`);
                this.account = username;
                this.token = data.token;
                this.emit("statusChanged");
            } catch (error) {
                console.error('An error occurred:', error);
            }
        } catch (error) {
            console.error(error);
        }
    }

}

export const manager: Manager = new Manager();
