import Express from "express";
import { z } from "zod"
// listen to a port for abuser scheduler


// Function to generate sinusoidal spikes
function sinusoidalSpikes(x, height, width, start) {
    const period = width + start; // Total period for each spike
    const phaseShift = width / 2; // Phase shift to center the spike

    return height * Math.sin(2 * Math.PI * (x + phaseShift) / period);
}

// Function to generate the overall abusive behavior function
function generateAbusiveBehavior(x, scheduler) {
    let result = 1; // Stable baseline

    for (const peak of scheduler.peaks) {
        // Check if the current time falls within the duration of the peak
        const startTime = peak.start  // Convert minutes to milliseconds
        const endTime = startTime + peak.width  // Convert minutes to milliseconds
        if (x >= startTime && x <= endTime) {
            // If within the duration, add sinusoidal spike
            result += sinusoidalSpikes(x - startTime, peak.height, peak.width, peak.start);
        }
    }

    return result;
}






let timer;

function Abuse(scheduler) {
    if (timer) clearInterval(timer);

    let i = 0;
    timer = setInterval(() => {
        i++;
        if (i * scheduler.ticker > scheduler.duration) i = 0;

        const count = Math.round(Math.abs(generateAbusiveBehavior(i * scheduler.ticker, scheduler)));

        for (let g = 0; g < count; g++) {
            const abort = new AbortController();

            const abortTimer = setTimeout(() => {
                abort.abort()
            }, scheduler.ticker * 2)



            console.log("goin to hit the IP", i)
            fetch("http://" + scheduler.targetIP, {
                signal: abort.signal
            }).then(() => clearTimeout(abortTimer)).catch(()=>{})

        }

    }, scheduler.ticker)

}





const App = Express();

App.use(Express.json());




// interface IAbuserSheduler {
//     peaks: {
//         height,
//         width,
//         start;
//     }[]
//     duration, // 1min
//     ticker,
//     targetIP: string,
// }

const Scheduler = z.object({
    targetIP: z.string(),
    ticker: z.number(),
    duration: z.number(),
    peaks: z.array(z.object({
        height: z.number(),
        width: z.number(),
        start: z.number(),
    }))
})


App.post("/", async (req, res) => {

    const data = await req.body;

    Scheduler.parse(data);
    Abuse(data)


    res.send("OK")
})

App.get("/", async (req, res) => {
    res.send("Alive")
})

App.listen("3000", () => {

    console.log("Listening to port 3000")

});