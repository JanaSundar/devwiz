export function setDataToLocalstorage<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
}


export function getDataFromLocalstorage<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}