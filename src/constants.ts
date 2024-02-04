export enum UserStatus {
    Login = 1,
    Logout = 2,
}

export enum URL {
    Login = "/api/v1/login",
    ChatList = "/api/v1/chat/list",
    ChatMessageList = "/api/v1/chat/message/list",
    RoomPerson = '/api/v1/room/${roomId}/person',
    AddPerson = '/api/v1/friend/add',
}
