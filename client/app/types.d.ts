
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
export interface ITransaction {
    session?: string,
    direction: string,
    msgType: string,
    seqNum: number,
    cliOrdId: string,
    ordStatus: string,
    message: string
}

export interface ISession {
    session: string;
    disconnected?: boolean;
    selected?: boolean;
}

export interface IFixParserService {
    parseFix(fix: string): any;
}