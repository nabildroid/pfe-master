


export function parseCookies(cookie: string) {

    const parts = cookie.split(/;|,/).map(e => e.trim()).map(e => e.split("=").map(e => e.replaceAll('"', "")));

    const cookies = parts.reduce((acc, v) => ({ ...acc, [v[0]]: v[1] }), {} as any);

    return cookies;
}




export async function delay(milliseconds: number) {
    await new Promise(r => setTimeout(r, milliseconds));
}