import { $ } from "bun"


export default async function DiscoverFortigates() {

    const aliveAddress = [] as string[];

    // Use map to create an array of promises for each fetch operation
    const fetchPromises = Array(253).fill("").map(async (_, i) => {
        const ip = "192.168.122." + (i + 2);

        try {

            const text = await $`curl http://${ip} --connect-timeout .5`.text();

            aliveAddress.push(ip);
        } catch (error) {

        } finally {
        }
    });

    await Promise.all(fetchPromises);


    return aliveAddress

}