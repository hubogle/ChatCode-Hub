import { ChatItem } from "../chatListProvider";
import { URL } from "../constants";
import { address, getUidMapName, storeUidMapName } from "../globals";
import { Get } from "./http";

interface ChatItemInfo {
    type: number,
    name: string,
    uid: number,
}

interface ChatResp {
    list: ChatItemInfo[],
}

interface ChatMessageResp {
    list: ChatMessageItem[],
}
export interface ChatMessageItem {
    content: string,
    nickname: string,
    send_at: number,
    type: number,
    uid: number,
}

export async function GetChatList(token: string | undefined) {
    try {
        let url = `http://${address}${URL.ChatList}`;
        const data = await Get(url, token) as ChatResp;
        const idLabelMap = new Map(data.list.map(item => [item.uid, item.name]));
        storeUidMapName(idLabelMap)
        const chatItems: ChatItem[] = data.list.map(item => {
            return new ChatItem(
                item.name,
                String(item.uid),
                item.type === 1 ? false : true,
                "person"
            );
        });
        return chatItems;
    } catch (error) {
        throw error;
    }
}

export async function GetRoomPerson(token: string | undefined, roomId: string) {
    try {
        let url = `http://${address}${URL.RoomPerson.replace("${roomId}", roomId)}`;
        const data = await Get(url, token) as ChatResp;
        const chatItems: ChatItem[] = data.list.map(item => {
            return new ChatItem(
                item.name,
                `${roomId}-${item.uid}`, // 为了区分群组和个人，这里的 id 用了 `roomId-uid
                item.type === 1 ? false : true,
                "member",
            );
        });
        return chatItems;
    } catch (error) {
        throw error;
    }
}

export async function GetChatMessageList(token: string | undefined, uid: string, type: number) {
    try {
        let url = `http://${address}${URL.ChatMessageList}?uid=${uid}&type=${type}`; // 通过 uid 和 type 获取聊天记录
        const data = await Get(url, token) as ChatMessageResp;
        const chatMessages: ChatMessageItem[] = data.list.map(item => {
            return {
                content: item.content,
                nickname: getUidMapName(item.uid),
                send_at: item.send_at,
                type: item.type,
                uid: item.uid,
            };
        });
        return chatMessages;
    } catch (error) {
        throw error;
    }

}
