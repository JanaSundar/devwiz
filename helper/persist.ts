export function setDataToLocalstorage<T>(key: string, data: T) {
    if(typeof window === 'undefined') return null;
    window.localStorage.setItem(key, JSON.stringify(data));
}


export function getDataFromLocalstorage<T>(key: string): T | null {
    if(typeof window === 'undefined') return null;
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}