import { usePolkaDotContext } from './../hooks/usePolkadot';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import { useChronicle, useContributions, useHistoricalIncentives, useOwn } from './store/Store';
import { calculateBsxRewards, calculateCurrentHdxReward, useIncentives } from './../hooks/useIncentives';
import config from './../config';
import { fromKsmPrecision, ksmToUsd, toKsmPrecision, usdToHdx } from './../utils';
import CurrencyInput from 'react-currency-input-field';
import './CrowdloanContributeForm.scss'
import BigNumber from 'bignumber.js';

type Props = {
    totalContributionWeight: string
}

export const CrowdloanContributeForm = ({totalContributionWeight}: Props) => {
    
    const { contribute } = usePolkaDotContext();
    // reward calculation
    const own = useOwn();
    const chronicle = useChronicle()
    const incentives = useIncentives();
    const { activeAccountBalance, lastContributionStatus } = usePolkaDotContext();

    const [amount, setAmount] = useState<number | undefined>(undefined)

    const [rewardsReceived, setRewardsReceived] = useState({
        minimalBsxReceived: "0",
        currentBsxReward: "0",
        // TODO: convert KSM amount to HDX
        currentHdxReceived: "0",
    });

    useEffect(() => {
        log.debug('CrowdloanContributeForm', 'calculating rewards', amount, own, totalContributionWeight);
        if (!own || !chronicle || !totalContributionWeight) return;
        if (!own.data.crowdloan) return;
        if (!chronicle.data.curBlockNum) return;

        const contributions = [
            {
                amount: amount ? toKsmPrecision(amount) : "0",
                blockNum: chronicle.data.curBlockNum
            }
        ];

        const historicalIncentives: any = { data: {} };
        (historicalIncentives as any).data[chronicle.data.curBlockNum] = {
            hdxBonus: incentives.hdxBonus
        };

        const bsxRewards = calculateBsxRewards(
            contributions,
            chronicle,
            totalContributionWeight,
            own,
            historicalIncentives
        );

        log.debug('CrowdloanContributeForm', 'historicalIncentives', historicalIncentives)
        const hdxReward = calculateCurrentHdxReward(
            contributions,
            historicalIncentives
        )

        log.debug('CrowdloanContributeForm', bsxRewards, hdxReward);
        
        setRewardsReceived({
            minimalBsxReceived: new BigNumber(fromKsmPrecision(bsxRewards.accountMinimumBsxReward)).toFixed(6),
            currentBsxReward: new BigNumber(fromKsmPrecision(bsxRewards.accountCurrentBsxReward)).toFixed(6),
            currentHdxReceived: new BigNumber(usdToHdx(ksmToUsd(fromKsmPrecision(hdxReward)))).toFixed(6)
        })

    }, [
        amount,
        own,
        chronicle,
        totalContributionWeight
    ])

    const handleContributeClick = () => {
        log.debug('CrowdloanContributeForm', 'handleContributeClick', amount);
        // call contribute here
        contribute(toKsmPrecision(amount));
    }

    useEffect(() => {
        if (lastContributionStatus) setAmount(0)
    }, [
        lastContributionStatus
    ]);

    const handleContributeChange = (value: any) => {
        log.debug('CrowdloanContributeForm', 'handleContributeChange', value, activeAccountBalance);
        if (value == undefined) return setAmount(undefined);
        setAmount(value)
    }

    log.debug('CrowdloanContributeForm', 'rewardsReceived', rewardsReceived)

    const noop = () => {}

    return <div className="bsx-contribute-form">

        <div className="bsx-form-wrapper">
            <label>ksm contribution</label>
            <CurrencyInput
                name="amount"
                decimalsLimit={12}
                value={amount}
                placeholder={"Your sacrifice goes here"}
                onValueChange={handleContributeChange}
            />

            {/* rewards */}
            <label>minimal bsx received</label>
            <CurrencyInput
                name="minimal bsx received"
                decimalsLimit={6}
                disabled={true}
                value={rewardsReceived.minimalBsxReceived}
                onValueChange={noop}
            />

            <label>current bsx received</label>
            <CurrencyInput
                name="current bsx received"
                decimalsLimit={6}
                disabled={true}
                value={rewardsReceived.currentBsxReward}
                onValueChange={noop}
            />

            <label>current hdx received</label>
            <CurrencyInput
                name="current hdx received"
                decimalsLimit={6}
                disabled={true}
                value={rewardsReceived.currentHdxReceived}
                onValueChange={noop}
            />


            <button
                disabled={(!amount || amount == 0)}
                onClick={handleContributeClick}
            >Contribute</button>
        </div>

        <div className="contribution-status">
            {lastContributionStatus 
                ? "Thanksss for your sacrifice"
                : (
                    (lastContributionStatus == false)
                        ? "There was a problem with your contribution, please try again."
                        : ""

                )
            }
        </div>
    </div>
}