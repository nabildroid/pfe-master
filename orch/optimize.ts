
import DiscoverFortigates from "./discovers/discoverFortigates";
import Fortigate from "./repositories/fortigate";
import * as GA from "./ga";
import CommandAbusers from "./commandAbusers";
import { delay } from "./utils";


console.log("Discovering the Fortigates ...")
const aliveFortigates = await DiscoverFortigates();


if (aliveFortigates.length == 0) {
    console.log("No fortigate found, Exit");
    process.exit();
}

console.log("found " + aliveFortigates.length + " Fortigates")


console.log("initing all fortigates")

const foritgates = aliveFortigates.map(ip => new Fortigate(ip));
await Promise.all(foritgates.map(async f => {
    await f.init();
    await f.fetchHostname();
}))




const datacenter_forigate_hostname = "left"
console.log("Searching for the Datacenter Forigate under the hostname=", datacenter_forigate_hostname);


const dcForitgate = foritgates.find(f => f.hostname == datacenter_forigate_hostname);

if (!dcForitgate) {
    console.log("Data center fortigate not found, existing")
    process.exit();
}

console.log("forigate (" + dcForitgate.hostname + ") found, ip=" + dcForitgate.ip)






async function optimizeDuringPeriod() {
    // start the abusers and keep it durring the entire period
    await CommandAbusers("192.168.0.3");

    await delay(1000)
    // record the baseline (cpu utilization), ingress data in the datacenter (one minute)


    const baseline = await recordDCForitageStats(2);
    console.log(baseline);



    let ADNs = Array(3).fill("").map(e => GA.generateRandomConfig(1));
    for (let iteration = 0; iteration < 10; iteration++) {

        console.log(ADNs)
        for (let a = 0; a < ADNs.length; a++) {
            const adn = ADNs[a];
            console.log("Evaluating ", adn)
            dcForitgate!.setPortBandwidth(3, adn[0]);
            await delay(1000)
            const stats = await recordDCForitageStats(10);

            console.log(stats)
        }


        ADNs = Array(3).fill("").map(e => GA.generateRandomConfig(1));
    }

    // start the first iteration of GA
    //  -> generate Random Configs
    //  -> deploy the random configs (DNA 1)
    //  -> record the network behavour (1 min)
    //  -> deploy the random configs (DNA 2)
    //  -> record the network behavour (1 min)
    //  -> deploy the random configs (DNA 3)
    //  -> record the network behavour (1 min)
    //  -> run the evaluation

    // repeat for 5 times

    // deploy the best ADN
    // record the new stats
    // compare the initial baseline with current stats

}


await optimizeDuringPeriod();



async function recordDCForitageStats(seconds: number) {
    const baseline = [] as any[]

    await new Promise(async r => {
        const start = Date.now();
        for (let i = 0; i < 12000; i++) {
            console.log(i);
            const usage = await dcForitgate!.getResourceUtilization()
            const bandwidth = await dcForitgate!.getLivePortBandwidthUtilization(3)
            baseline.push([usage.cpu[0].current, bandwidth.tx])

            await delay(1000)
            if ((Date.now() - start) / 1000 > seconds) break;
        }

        r(null);
    });

    return baseline;
}