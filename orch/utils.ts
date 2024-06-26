


export function parseCookies(cookie: string) {

    const parts = cookie.split(/;|,/).map(e => e.trim()).map(e => e.split("=").map(e => e.replaceAll('"', "")));

    const cookies = parts.reduce((acc, v) => ({ ...acc, [v[0]]: v[1] }), {} as any);

    return cookies;
}




export async function delay(milliseconds: number) {
    await new Promise(r => setTimeout(r, milliseconds));
}







// Helper function to calculate median
export function calculateMedian(arr: number[]): number {
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);
    return sortedArr.length % 2 !== 0 ? sortedArr[mid] : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

// Helper function to calculate standard deviation
export function calculateStdDev(arr: number[]): number {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => (val - mean) ** 2);
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(variance);
}