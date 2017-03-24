
export interface IFixMessage {
    direction: string,

    clOrdId: string,
    symbol?: string,
    fillStatus?: number,
    lastShares?: number,
    cumQty?: number,
    lastPx?: number,
    avgPx?: number,
    leavesQty?: number,
    side?: number
}

export interface ISession {
    name: string;
    selected?: boolean;
}