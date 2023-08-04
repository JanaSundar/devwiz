export function setDataToLocalstorage<T>(key: string, data: T) {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(data));
    }

    return null
}


export function getDataFromLocalstorage<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
        const data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    return null;
}