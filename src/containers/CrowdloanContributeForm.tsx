import { usePolkaDotContext } from './../hooks/usePolkadot';
import log from 'loglevel';
import { useEffect, useState } from 'react';
import { useChronicle, useContributions, useHistoricalIncentives, useOwn } from './store/Store';
import { calculateBsxRewards, calculateCurrentHdxReward, useIncentives } from './../hooks/useIncentives';
import config from './../config';
import { fromKsmPrecision, ksmToUsd, toKsmPrecision, usdToHdx } from './../utils';
import CurrencyInput from 'react-currency-input-field';

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

    const [amount, setAmount] = useState<number | undefined>(0)

    const [rewardsReceived, setRewardsReceived] = useState({
        minimalBsxReceived: "0",
        currentBsxReward: "0",
        // TODO: convert KSM amount to HDX
        currentHdxReceived: "0",
    });

    useEffect(() => {
        console.log('amount updated')
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

        console.log('input contributions', contributions)

        const historicalIncentives: any = { data: {} };
        (historicalIncentives as any).data[chronicle.data.curBlockNum] = {
            hdxBonus: incentives.hdxBonus
        };

        console.log('input incentives', historicalIncentives);


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
        
        // const hdxReward =

        setRewardsReceived({
            minimalBsxReceived: fromKsmPrecision(bsxRewards.accountMinimumBsxReward),
            currentBsxReward: fromKsmPrecision(bsxRewards.accountCurrentBsxReward),
            currentHdxReceived: fromKsmPrecision(hdxReward)
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
        console.log('lastContributionStatusChanged', lastContributionStatus)
        if (lastContributionStatus) setAmount(0)
    }, [
        lastContributionStatus
    ]);

    const handleContributeChange = (value: any) => {
        log.debug('CrowdloanContributeForm', 'handleContributeChange', value, activeAccountBalance);
        console.log('handleContributeChange', value)
        if (value == undefined) return setAmount(undefined);
        setAmount(value)
    }

    log.debug('CrowdloanContributeForm', 'rewardsReceived', rewardsReceived)

    const noop = () => {}

    return <div>
        <h1>Contribute</h1>

        <p>total contribution weight {totalContributionWeight}</p>
        <p>last contribution status {
            (lastContributionStatus == undefined)
                ? 'unknown' 
                : (lastContributionStatus) ? 'contribution successful' : 'error contributing'
        }</p>

        <CurrencyInput
            name="amount"
            decimalsLimit={12}
            value={amount}
            onValueChange={handleContributeChange}
        />

        <br/>
        {/* rewards */}
        <input 
            name="amount" 
            type="number"
            value={rewardsReceived.minimalBsxReceived}
            onChange={noop}
        ></input>

        <input 
            name="amount" 
            type="number"
            value={rewardsReceived.currentBsxReward}
            onChange={noop}
        ></input>

        <input 
            name="amount" 
            type="number"
            value={usdToHdx(ksmToUsd(rewardsReceived.currentHdxReceived))}
            onChange={noop}
        ></input>


        <button
            disabled={(!amount || amount == 0)}
            onClick={handleContributeClick}
        >Contribute</button>
    </div>
}