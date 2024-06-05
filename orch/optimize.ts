
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




const datacenter_forigate_hostname = "data-center"
console.log("Searching for the Datacenter Forigate under the hostname=", datacenter_forigate_hostname);


const dcForitgate = foritgates.find(f => f.hostname == datacenter_forigate_hostname);

if (!dcForitgate) {
    console.log("Data center fortigate not found, existing")
    process.exit();
}

const agenceFortigates = foritgates.filter(e => e != dcForitgate);

console.log("forigate (" + dcForitgate.hostname + ") found, ip=" + dcForitgate.ip)





async function optimizeDuringPeriod() {
    // start the abusers and keep it durring the entire period
    await CommandAbusers("192.168.0.4");
    // record the baseline (cpu utilization), ingress data in the datacenter (one minute)



    console.log("Recording the baseline")

    delay(1000)

    const baseline = await recordDCForitageStats(60, 1);
    console.log("without Opimization", baseline.evaluate());



    let Chromos = Array(6).fill("").map(e => GA.generateRandomADN(agenceFortigates.length));
    let topOne = [] as any
    for (let iteration = 0; iteration < 4; iteration++) {
        console.log("## Iteration ->", iteration)

        const contest = {} as { [key: number | string]: any }

        for (let a = 0; a < Chromos.length; a++) {
            const chromo = Chromos[a];
            console.log("Evaluating ", chromo)

            for (let f = 0; f < agenceFortigates.length; f++) {
                await agenceFortigates[f].setPortBandwidth(3, chromo[f])
            }

            await delay(2000)
            try {
                const stats = await recordDCForitageStats(10,0);

                const chromoEvaluation = GA.fitness(stats.evaluate());

                contest[Math.floor(chromoEvaluation)] = chromo

            } catch (e) {
                continue;
            }

        }


        console.log(contest);



        // selection
        const list = Object.keys(contest).map(e => parseInt(e)).sort((a, b) => b - a);
        const top = list.slice(0, Math.floor(Chromos.length / 2));
        const selected = top.map(e => contest[e.toString()]);

        topOne = selected[0];

        //crossOver
        Chromos = GA.crossOverAll(selected, Chromos.length)
        // mutation
        Chromos = Chromos.map(e => GA.mutation(e, 0.33))
    }


    for (let f = 0; f < agenceFortigates.length; f++) {
        await agenceFortigates[f].setPortBandwidth(3, topOne[f])
    }

    await delay(3)



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
    const after = await recordDCForitageStats(60, 1);
    console.log("without Optimization", baseline.evaluate());
    console.log("with Optimization", after.evaluate());
}


await optimizeDuringPeriod();



async function recordDCForitageStats(seconds: number, fast: number) {

    const baseline = new GA.Stats(fast);

    await new Promise(async r => {
        const start = Date.now();
        for (let i = 0; i < 12000; i++) {
            const usage = await dcForitgate!.getResourceUtilization()
            const bandwidth = await dcForitgate!.getLivePortBandwidthUtilization(2)
            baseline.push(usage.cpu[0].current, bandwidth.tx)

            await delay(1000)
            if ((Date.now() - start) / 1000 > seconds) break;
        }

        r(null);
    });

    return baseline;
}
