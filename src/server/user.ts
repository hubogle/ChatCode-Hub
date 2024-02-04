import { URL } from "../constants";
import { address } from "../globals";
import { Post } from "./http";

export async function UserLogin(address: string | undefined, account: string | undefined, password: string | undefined) {
    try {
        let url = `http://${address}${URL.Login}`;
        const data = await Post(url, {
            account,
            password,
        }, "");
        return data;

    } catch (error) {
        throw error;
    }
}

export async function AddPerson(token: string | undefined, uid: number) {
    try {
        let url = `http://${address}${URL.AddPerson}`;
        const data = await Post(url, {
            uid: uid,
        }, token);
        return data;
    } catch (error) {
        throw error;
    }
}
