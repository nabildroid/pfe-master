interface ValueEntry {
    0: number; // Timestamp
    1: number; // Value
}

interface TimeInterval {
    values: ValueEntry[];
    max: number;
    min: number;
    average: number;
    start: number;
    end: number;
}

interface HistoricalData {
    "1-min": TimeInterval;
    "10-min": TimeInterval;
}

interface Data {
    current: number;
    historical: HistoricalData;
}



export default interface IResources {
    cpu: Data[],
    mem: Data[],
    session: Data[],
    session6: Data[],
    setuprate: Data[],
    setuprate6: Data[],
    npu_session: Data[],
    npu_session6: Data[],
    disk_lograte: Data[],
    faz_lograte: Data[],
    forticloud_lograte: Data[],
    faz_cloud_lograte: Data[],
    gtp_tunnel: Data[],
    gtp_tunnel_setup_rate: Data[],
}