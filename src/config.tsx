import BigNumber from "bignumber.js";
import { toKsmPrecision } from './utils';
import ksmPrecision from "./ksmPrecision";

export const precisionMultiplierBN = new BigNumber('10').pow('6');
export const ksmPrecisionMultiplierBN = new BigNumber('10').pow('12');


const config = {

    // processorUrl: 'http://localhost:4000/graphql',
    processorUrl: 'https://api-crowdloan-basilisk.hydradx.io/graphql',
    nodeUrl: 'wss://ksm-arch-01.hydration.cloud',

    // Kilt
    // ownParachainId: '2086',
    ownParachainId: '2090',
    // 31.8 - 3 days
    ownCrowdloanBlockHeight: '8979298',
    dappName: 'Basilisk Crowdloan',
    chronicleRefetchTimeout: 6000, // ms
    auctionEndingPeriodLength: 72000,
    crowdloanCap: new BigNumber(toKsmPrecision((new BigNumber('222222')))),
    opportunityCost: new BigNumber('0.1375'),
    ksmToUsd: '400',
    hdxToUsd: '0.08059',

    ksmPrecision,
    displayPrecision: 6,
    chart: {
        historicalDataSpan: 600,
        blocksPerDay: 14400,
        auctionClosingStart: 9035066
    },

    incentives: {
        hdx: {
            leadPercentageRateCliffRange: [
                new BigNumber('15')
                    .multipliedBy(precisionMultiplierBN)
                    .toNumber(),
                new BigNumber('20')
                    .multipliedBy(precisionMultiplierBN)
                    .toNumber(),
            ],
            scale: {
                max: 30,
                min: 5,
                none: 0,
            }
        },
        bsx: {
            allocated: new BigNumber(toKsmPrecision(new BigNumber('15000000000'))),
            scale: {
                max: 1,
                min: 0,
                none: 0
            }
        }
    }
};

export default config;
