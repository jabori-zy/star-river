import { PriceSource } from "@/types/indicator";


export type SmaConfig = {
    period: number;
    priceSource: PriceSource;
}

export type EmaConfig = {
    period: number;
    priceSource: PriceSource;
}

export type BollConfig = {
    period: number;
    stdDev: number;
    priceSource: PriceSource;
}