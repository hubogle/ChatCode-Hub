export enum UserStatus {
    Login = 1,
    Logout = 2,
}

export enum URL {
    Login = "/api/v1/login",
    ChatList = "/api/v1/chat/list",
    RoomPerson = '/api/v1/room/${roomId}/person',
}
