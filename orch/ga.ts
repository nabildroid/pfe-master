import DiscoverFortigates from "./discovers/discoverFortigates";
import Fortigate from "./repositories/fortigate";




const aliveFortigates = await DiscoverFortigates();


const [mainIP] = aliveFortigates;

console.log(aliveFortigates)
const left = new Fortigate(mainIP);

await left.init();



await left.setPortBandwidth(3, 5645);