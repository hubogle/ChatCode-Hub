import { EventEmitter } from "events";
import { storeGlobals, storeStatus, storeUidMapName } from './globals';
import { CreateRoom, UserLogin } from "./server/user";

import * as vscode from "vscode";

export class Manager extends EventEmitter {
    private account: string | undefined;
    private token: string | undefined;
    private address: string | undefined;
    private uid: number | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        super();
        this.loadUserInfo();
    }

    private saveUserInfo() {
        storeGlobals(this.address, this.token, this.account, this.uid);
        this.context.globalState.update('account', this.account);
        this.context.globalState.update('token', this.token);
        this.context.globalState.update('address', this.address);
        this.context.globalState.update('uid', this.uid);
        if (this.uid && this.account) {
            storeUidMapName(new Map([[this.uid, this.account]]));
        }
    }


    private loadUserInfo() {
        this.account = this.context.globalState.get('account');
        this.token = this.context.globalState.get('token');
        this.address = this.context.globalState.get('address');
        this.uid = this.context.globalState.get('uid');
        storeGlobals(this.address, this.token, this.account, this.uid);
        if (this.token) {
            storeStatus(true)
            if (this.uid && this.account) {
                storeUidMapName(new Map([[this.uid, this.account]]));
            }
            vscode.commands.executeCommand('chatcode-hub.ws');
        }
    }

    private clearUserInfo() {
        this.context.globalState.update('account', undefined);
        this.context.globalState.update('token', undefined);
        this.context.globalState.update('address', undefined);
        this.context.globalState.update('uid', undefined);
        storeGlobals(undefined, undefined, undefined, undefined);
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
                const data = await UserLogin(address, username, password)
                vscode.window.showInformationMessage(`Successfully login as ${username}`);
                this.account = username;
                this.token = data.token;
                this.uid = data.uid;
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

    public async AddPerson(): Promise<void> {
        const person = await vscode.window.showInputBox({
            prompt: "Please enter the person's uid",
            placeHolder: "uid",
            validateInput: (text) => {
                return text === "" ? "Please enter the person's uid" : null;
            },
        });
    }

    public async CreateRoom(): Promise<void> {
        const roomName = await vscode.window.showInputBox({
            prompt: "Please enter the room's name",
            placeHolder: "room name",
            validateInput: (text) => {
                return text === "" ? "Please enter the room's name" : null;
            },
        });
        if (!roomName) {
            vscode.window.showErrorMessage("Please enter the room's name");
            return;
        }
        const roomSalt = await vscode.window.showInputBox({
            prompt: "Please enter the room's salt(it can be empty)",
            placeHolder: "room salt",
        });
        try {
            const data = await CreateRoom(this.token, roomName, roomSalt || "");
            const roomID = data.room_id;

            if (!roomSalt) {
                vscode.window.showInformationMessage(`Successfully created room ${roomID} without a password.`);
            } else {
                vscode.window.showInformationMessage(`Successfully created room ${roomID} with salt ${roomSalt}.`);
            }

            vscode.commands.executeCommand('chatcode-hub.refresh');
        } catch (error) {
            console.error('An error occurred:', error);
            vscode.window.showErrorMessage(`Failed to create room: ${error}`);
        }
    }
}
