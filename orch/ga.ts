


export function generateRandomConfig(length: number) {


    const kb = 1000;
    const mb = kb * 1000;
    return Array(length).fill("").map(e =>
        Math.floor(Math.random() * mb * 10) + kb
    )
}