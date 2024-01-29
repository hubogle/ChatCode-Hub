interface ResponseData {
    code: number;
    msg: string;
    data: any;
}

export async function sendPostRequest(url: string, username: string | undefined, password: string | undefined) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as ResponseData;
        if (data.code === 200) {
            return data.data;
        } else {
            throw new Error(data.msg);
        }
    } catch (error) {
        console.error(error);
        throw error;

    }
}
