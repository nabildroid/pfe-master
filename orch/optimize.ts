
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

    await delay(2000)
    // record the baseline (cpu utilization), ingress data in the datacenter (one minute)


    console.log("Recording the baseline")
    const baseline = await recordDCForitageStats(60);
    console.log("without Opimization", baseline.evaluate());



    let ADNs = Array(6).fill("").map(e => GA.generateRandomADN(1));
    for (let iteration = 0; iteration < 4; iteration++) {
        console.log("## Iteration ->", iteration)

        const contest = {} as { [key: number | string]: any }

        for (let a = 0; a < ADNs.length; a++) {
            const adn = ADNs[a];
            console.log("Evaluating ", adn)
            dcForitgate!.setPortBandwidth(3, adn[0]);
            await delay(1000)
            const stats = await recordDCForitageStats(20);

            contest[Math.floor(GA.fitness(stats.evaluate()))] = adn
        }


        const a = Object.keys(contest).map(e => parseInt(e));
        a.sort((a, b) => b - a)


        const top = a.slice(0, Math.floor(ADNs.length / 2 + 1));

        console.log(contest);

        const selected = top.map(e => contest[e.toString()]);


        ADNs = GA.crossOverAll(selected, ADNs.length)
        ADNs = ADNs.map(e => GA.mutation(e, 0.5))
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



    console.log("##########################################")
    const after = await recordDCForitageStats(60);
    console.log("without Optimization", baseline.evaluate());
    console.log("with Optimization", after.evaluate());
}


await optimizeDuringPeriod();



async function recordDCForitageStats(seconds: number) {
    const baseline = new GA.Stats();

    await new Promise(async r => {
        const start = Date.now();
        for (let i = 0; i < 12000; i++) {
            console.log(i);
            const usage = await dcForitgate!.getResourceUtilization()
            const bandwidth = await dcForitgate!.getLivePortBandwidthUtilization(3)
            baseline.push(usage.cpu[0].current, bandwidth.tx)

            await delay(1000)
            if ((Date.now() - start) / 1000 > seconds) break;
        }

        r(null);
    });

    return baseline;
}