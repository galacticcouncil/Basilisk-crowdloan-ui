import { usePolkaDotContext } from '../hooks/usePolkadot';
import log from 'loglevel';
import { useEffect, useState } from 'react';
// import { useChronicle, useContributions, useHistoricalIncentives, useOwn } from './oldStore/Store';
// import { calculateBsxRewards, calculateCurrentHdxReward, useIncentives } from '../hooks/useIncentives';
// import config from '../oldConfig';
import { fromKsmPrecision, ksmToUsd, toKsmPrecision, usdToHdx } from './../utils';
import CurrencyInput from 'react-currency-input-field';
import './CrowdloanContributeForm.scss'
import BigNumber from 'bignumber.js';
import { useChronicle, useHistoricalIncentives, useIncentives, useOwnFundsPledged, useOwnHasWonAnAuction } from './store/Store';
import { Contribution, HistoricalIncentive } from 'src/hooks/useQueries';
import config, { ksmPrecisionMultiplierBN, precisionMultiplierBN } from 'src/config';
import { calculateBsxMultiplier, calculateCurrentBsxReceived, calculateCurrentHdxReceived, calculateMinimumBsxReceived } from 'src/hooks/useCalculateIncentives';
import ksmPrecision from 'src/ksmPrecision';

type Props = {
    totalContributionWeight: string,
    connectAccount: any
}

export const CrowdloanContributeForm = ({connectAccount}: Props) => {
    const { activeAccountBalance, lastContributionStatus, contribute, activeAccount } = usePolkaDotContext();
    const [amount, setAmount] = useState<number | undefined>(undefined)
    const defaultRewards = {
        minimalBsxReceived: "0",
        currentBsxReceived: "0",
        // TODO: convert KSM amount to HDX
        currentHdxReceived: "0",
    };
    const [rewardsReceived, setRewardsReceived] = useState(defaultRewards);

    const { data: { lastProcessedBlock, mostRecentAuctionClosingStart } } = useChronicle()
    const { data: { totalContributionWeight, leadPercentageRate } } = useIncentives();
    const ownFundsPledged = useOwnFundsPledged()
    const ownHasWonAnAuction = useOwnHasWonAnAuction();

    useEffect(() => {
        const contributions: Contribution[] = [
            {
                blockHeight: lastProcessedBlock,
                balance: new BigNumber(amount || 0).multipliedBy(ksmPrecisionMultiplierBN).toFixed(0),
                crowdloan: {
                    id: config.ownParachainId
                }
            }
        ];

        if (!amount) return setRewardsReceived(defaultRewards);

        const minimumBsxReceived = calculateMinimumBsxReceived(
            contributions, 
            mostRecentAuctionClosingStart
        );

        const currentContributionWeight = new BigNumber(contributions[0].balance)
            .multipliedBy(
                calculateBsxMultiplier(
                    lastProcessedBlock,
                    mostRecentAuctionClosingStart,
                )
            )
            .multipliedBy(precisionMultiplierBN);

        const totalCurrentContributionWeight = new BigNumber(totalContributionWeight)
            .plus(currentContributionWeight)
            .toFixed(0);

        const currentBsxReceived = calculateCurrentBsxReceived(
            contributions,
            mostRecentAuctionClosingStart,
            totalCurrentContributionWeight
        );

        const historicalIncentives: HistoricalIncentive[] = [{
            blockHeight: lastProcessedBlock,
            leadPercentageRate
        }];

        const currentHdxReceived = usdToHdx(ksmToUsd(calculateCurrentHdxReceived(
            contributions, 
            historicalIncentives
        )));

        setRewardsReceived({
            minimalBsxReceived: new BigNumber(fromKsmPrecision(minimumBsxReceived)).toFixed(config.displayPrecision),
            currentBsxReceived: new BigNumber(fromKsmPrecision(currentBsxReceived)).toFixed(config.displayPrecision),
            // TODO: convert KSM amount to HDX
            currentHdxReceived: new BigNumber(fromKsmPrecision(currentHdxReceived)).toFixed(config.displayPrecision),
        })
    }, [
        lastProcessedBlock,
        leadPercentageRate,
        mostRecentAuctionClosingStart,
        totalContributionWeight,
        amount
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
        if (config.crowdloanCap.minus(ownFundsPledged).lt(toKsmPrecision(value))) return;
        setAmount(value)
    }

    const noop = () => {}

    return <div className="bsx-contribute-form">

        <div className="bsx-form-wrapper">
            <label>ksm contribution</label>
            <CurrencyInput
                name="amount"
                decimalsLimit={12}
                value={amount}
                disabled={ownHasWonAnAuction}
                allowNegativeValue={false}
                placeholder={ownHasWonAnAuction ? "Sacrifice not required" : "Sacrifice goes here"}
                intlConfig={{ locale: 'en-US' }}
                onValueChange={handleContributeChange}
            />

            {/* rewards */}
            <label>minimal bsx received</label>
            <CurrencyInput
                name="minimal bsx received"
                disabled={true}
                value={rewardsReceived.minimalBsxReceived}
                onValueChange={noop}
            />

            <label>current bsx received</label>
            <CurrencyInput
                name="current bsx received"
                disabled={true}
                value={rewardsReceived.currentBsxReceived}
                onValueChange={noop}
            />

            <label>current hdx received</label>
            <CurrencyInput
                name="current hdx received"
                disabled={true}
                value={rewardsReceived.currentHdxReceived}
                onValueChange={noop}
            />

            {ownHasWonAnAuction 
                ? (
                    <button
                        disabled={true}
                    >
                        Slot Ssss...ssecured
                    </button>
                )
                : (
                    activeAccount
                        ? (
                            <button
                                disabled={(!amount || amount == 0)}
                                onClick={handleContributeClick}
                            >Contribute</button>
                        )
                        : (
                            <button
                                onClick={connectAccount}
                            >
                                Connect Account
                            </button>
                        )
                )
            }

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
