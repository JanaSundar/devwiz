export function isJSONSafe(obj: any): boolean {
    if (typeof obj === 'object' && obj !== null) {
        // Check if the object is an array
        if (Array.isArray(obj)) {
            return obj.every((item) => isJSONSafe(item));
        }

        // Check for nested objects
        for (const key in obj) {
            if (typeof key !== 'string' || !isJSONSafe(obj[key])) {
                return false;
            }
        }

        return true;
    } else {
        return true;
    }
}