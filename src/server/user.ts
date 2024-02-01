import { URL } from "../constants";
import { Post } from "./http";

export async function UserLogin(address: string | undefined, account: string | undefined, password: string | undefined) {
    try {
        let url = `http://${address}${URL.Login}`;
        console.log(url);
        console.log(account, password);
        const data = await Post(url, {
            account,
            password,
        }, "");
        return data;

    } catch (error) {
        throw error;
    }
}
