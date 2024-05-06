import { Axios } from "axios";
import type IResources from "../types/iresources";
import { parseCookies } from "../utils";



export default class Fortigate {
    ip: string;

    http!: Axios

    hostname?: string;
    ccsrfToken?: string;

    constructor(ip: string) {
        this.ip = ip;
    }




    async init() {
        const request1 = await fetch(`http://${this.ip}/logincheck`, {
            method: "POST",
            "credentials": "omit",
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Pragma": "no-cache",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "If-Modified-Since": "Sat, 1 Jan 2000 00:00:00 GMT",
                "Content-Type": "text/plain;charset=UTF-8"
            },
            "body": "ajax=1&username=admin&secretkey=admin&redir=%2F",
            "mode": "cors"
        });


        const token = request1.headers.get("set-cookie");




        this.http = new Axios({
            baseURL: `http://${this.ip}/api/v2/`,
            headers: {
                "cookie": token as any,
                "Content-Type": "application/json"
            }
        })

        // get the srf token
        const cookies = parseCookies(token ?? "");
        const srfKey = Object.keys(cookies).find(d => d.startsWith("ccs"));
        if (srfKey) {
            this.ccsrfToken = cookies[srfKey]
        }
    }



    async fetchHostname() {
        const { data } = await this.http.get("monitor/web-ui/state");

        const { results } = JSON.parse(data);

        this.hostname = results.hostname

    }



    async getResourceUtilization() {

        const { data } = await this.http.get("/monitor/system/resource/usage")


        const { results } = JSON.parse(data);

        return results as IResources;
    }

    async setPortBandwidth(port: number, bandwidthInKB: number) {


        const { data } = await this.http.put(`cmdb/system/interface/port${port}`, JSON.stringify({
            outbandwidth: bandwidthInKB,

        }), {
            headers: {
                "X-CSRFTOKEN": this.ccsrfToken
            }
        })

    }


    async getLivePortBandwidthUtilization(port: number) {
        const { data } = await this.http.get(`/monitor/system/traffic-history/interface?interface=port${port}&time_period=hour`)


        const { results } = JSON.parse(data);

        const { last_tx, last_rx } = results;

        return {
            tx: last_tx,
            rx: last_rx
        }
    }



}