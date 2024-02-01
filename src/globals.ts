export let address: string | undefined;
export let token: string | undefined;
export let uid: number | undefined;
export let account: string | undefined;
export let status: boolean | undefined;

export function storeGlobals(newAddress: string | undefined, newToken: string | undefined, newAccount: string | undefined, newUid: number | undefined) {
    address = newAddress;
    token = newToken;
    account = newAccount;
    uid = newUid;
}

export function storeStatus(newStatus: boolean | undefined) {
    status = newStatus;
}
