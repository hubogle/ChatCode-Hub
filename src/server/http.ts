interface ResponseData {
    code: number;
    msg: string;
    data: any;
}

export async function Post(url: string, body: any, token: string | undefined) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(body)
        });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

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

export async function Get(url: string, token: string | undefined) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

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
