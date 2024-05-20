import { calculateMedian, calculateStdDev } from "./utils";






function RandomGene() {

    const kb = 1000;
    const mb = kb * 1000;

    return Math.floor(Math.random() * mb * 10) + kb
}

export function generateRandomADN(length: number) {

    return Array(length).fill("").map(e => RandomGene())
}






export function crossOverAll(ADNs: number[][], length: number) {

    console.log(arguments);


    const children = [] as number[][];

    for (let i = 0; i < length; i++) {

        const A = Math.floor(Math.random() * ADNs.length);
        const B = Math.floor(Math.random() * ADNs.length);

        if (A == B) {
            i--;
            continue;
        }

        else children.push(crossOverOne(ADNs[A], ADNs[B]))
    }

    return children
}


export function crossOverOne(a: number[], b: number[]) {
    if (a.length != b.length) {
        console.error("ADNs length doesn't match")
        process.exit();
    }


    const c = [] as any[];

    for (let i = 0; i < a.length; i++) {
        if (Math.random() < .5) {
            c.push(b[i])
        } else c.push(a[i])

    }

    return c
}




export function mutation(adn: number[], rate: number) {

    const newAdn = [];
    for (let i = 0; i < adn.length; i++) {
        if (Math.random() < rate) {
            newAdn.push(RandomGene())
        } else newAdn.push(adn[i])
    }


    return newAdn;
}

export function fitness(stats: {
    cpu: {
        median: number,
        stdDev: number
    },
    dataRate: {
        median: number,
        stdDev: number
    }
}) {
    return stats.dataRate.median / (stats.cpu.median + 1)
}



export class Stats {
    vals = [] as [number, number][]



    constructor() {
        this.vals = []
    }



    push(cpu: number, dataRate: number) {
        this.vals.push([cpu, dataRate])
    }



    evaluate() {
        // Extract CPU and dataRate values from the stored array
        const cpus = this.vals.map(([cpu]) => cpu);
        const dataRates = this.vals.map(([, dataRate]) => dataRate);

        // Calculate median and standard deviation for CPU and data rate
        const cpuMedian = calculateMedian(cpus);
        const cpuStdDev = calculateStdDev(cpus);
        const dataRateMedian = calculateMedian(dataRates);
        const dataRateStdDev = calculateStdDev(dataRates);

        return {
            cpu: {
                median: cpuMedian,
                stdDev: cpuStdDev
            },
            dataRate: {
                median: dataRateMedian,
                stdDev: dataRateStdDev
            }
        };
    }
}
