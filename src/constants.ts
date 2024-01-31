export enum UserStatus {
    Login = 1,
    Logout = 2,
}

export enum URL {
    Login = "/api/v1/user/login",
    ChatList = "http://127.0.0.1:8080/api/v1/chat/list",
    RoomPerson = 'http://127.0.0.1:8080/api/v1/room/${roomId}/person',
}
