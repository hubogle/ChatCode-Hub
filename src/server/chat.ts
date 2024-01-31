import { ChatItem } from "../chatListProvider";
import { URL } from "../constants";
import { Get } from "./http";

interface ChatItemInfo {
    type: number,
    name: string,
    uid: number,
}

interface ChatResp {
    list: ChatItemInfo[],
}

export async function GetChatList(token: string) {
    try {
        const data = await Get(URL.ChatList, token) as ChatResp;
        const chatItems: ChatItem[] = data.list.map(item => {
            return new ChatItem(
                item.name,
                String(item.uid),
                item.type === 1 ? false : true,
            );
        });
        return chatItems;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function GetRoomPerson(token: string, roomId: string) {
    try {
        const url = URL.RoomPerson.replace("${roomId}", roomId);
        const data = await Get(url, token) as ChatResp;
        const chatItems: ChatItem[] = data.list.map(item => {
            return new ChatItem(
                item.name,
                `${roomId}-${item.uid}`, // 为了区分群组和个人，这里的 id 用了 `roomId-uid
                item.type === 1 ? false : true,
            );
        });
        return chatItems;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
