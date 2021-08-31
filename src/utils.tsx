import BigNumber from 'bignumber.js';
import ksmPrecision from './ksmPrecision';
import config from './config';

export const toKsmPrecision = (humanAmount: any) => {
    const preciseAmount = new BigNumber(humanAmount)
            .multipliedBy(
                new BigNumber(10)
                    .exponentiatedBy(12)
            )
            .toFixed(ksmPrecision)

    return preciseAmount;
}

export const fromKsmPrecision = (preciseAmount: any) => {
    const humanAmount = new BigNumber(preciseAmount)
            .dividedBy(
                new BigNumber(10)
                    .exponentiatedBy(12)
            )
            .toFixed(ksmPrecision)

    return humanAmount;
}

export const ksmToUsd = (amount: any) => {
    return new BigNumber(amount)
        .multipliedBy(config.ksmToUsd)
        .toFixed(ksmPrecision)
}

export const usdToHdx = (amount: any) => {
    return new BigNumber(amount)
        .dividedBy(config.hdxToUsd)
        .toFixed(ksmPrecision)
}