import { useCallback, useEffect, useState } from 'react';
import { useChronicleData, useOwnData, useSiblingData } from 'src/hooks/useData';
import { ActionType, useStoreContext, useContributions, useHistoricalIncentives } from '../containers/store/Store'
import { Line, defaults } from 'react-chartjs-2';
import BigNumber from 'bignumber.js';
import config from '../config'
import { useCalculateRewardsReceived, useHistoricalIncentivesData, useIncentives } from 'src/hooks/useIncentives';
import { useAccountData, useTotalKsmContributed } from 'src/hooks/useAccountData';
import linearScale from 'simple-linear-scale';

// TODO: append data to the graph datasets instead, and let it animate
// however due to the scale of the graph the append-animation might be negligible.
// But the initial animation would be nice to have

// turn off graph animations
defaults.animation = false;

/**
 * Fetch all data required to display the incentive dashboard
 */
const useDashboardData = () => {
    let { dispatch } = useStoreContext();
    // chronicle data
    let { chronicle } = useChronicleData();
    // own data
    let { own } = useOwnData();
    let { sibling } = useSiblingData()
    let incentives = useIncentives()
    const { connectAccount, account, contributions } = useAccountData();
    const totalKsmContributed = useTotalKsmContributed();
    const rewardsReceived = useCalculateRewardsReceived();
    const historicalIncentives = useHistoricalIncentives()

    /**
     * Function that triggers loading of a chronicle,
     * which subsequently triggers loading of all
     * chronicle-dependent data
     */
    const loadChronicle = () => dispatch({
        type: ActionType.LoadChronicle
    });

    // on the initial load, load the chronicle
    useEffect(() => loadChronicle(), []);

    /**
     * Refresh the dashboard data (actually just the chronicle) every `blockTime`.
     * Data available for the dashboard is limited by the already indexed data, which
     * is represented by the `curBlockNum` in the chronicle. We still try to fetch the
     * chronicle every `blockTime`, since the assumption is that it will be 
     * updated in due time/quickly enough.
     */
    // useEffect(() => {
    //     const intervalId = setInterval(loadChronicle, config.blockTime)
    //     return () => clearInterval(intervalId)
    // }, [])

    return {
        chronicle,
        own,
        loadChronicle,
        sibling,
        incentives,
        connectAccount,
        account,
        contributions,
        historicalIncentives,
        totalKsmContributed,
        rewardsReceived
    };
}

const divideKSMBy = new BigNumber(10).exponentiatedBy(12)
const parseChartDataPoint = (chartDataPoint: string) => new BigNumber(chartDataPoint)
    .dividedBy(divideKSMBy)
    .toFixed(0)

const Dashboard = () => {
    // obtain data required to display the dashboard
    const {
        chronicle,
        own,
        loadChronicle, sibling, incentives, account, connectAccount, contributions, historicalIncentives,
        totalKsmContributed,
        rewardsReceived 
    } = useDashboardData();

    // testing chart stuff
    const [lineChartData, setLineChartData] = useState({
        labels: [],
        datasets: []
    })

    const getLineChartData = () => {
        const lineChartData = {
            labels: own.data.aggregatedCrowdloanBalances
                ?.map(aggregatedCrowdloanBalance => aggregatedCrowdloanBalance.blockNum)
                .concat(chronicle.data.curBlockNum ? [chronicle.data.curBlockNum] : []),
            datasets: [
                {
                    label: 'own',
                    data: own.data.aggregatedCrowdloanBalances
                        ?.map(aggregatedCrowdloanBalance => parseChartDataPoint(`${aggregatedCrowdloanBalance.raised}`))
                        .concat(own.data.crowdloan ? [
                            parseChartDataPoint(`${own.data.crowdloan?.raised}`)
                        ] : []),
                    borderColor: 'red'
                },
                {
                    label: 'sibling',
                    data: sibling.data.aggregatedCrowdloanBalances
                        ?.map(aggregatedCrowdloanBalance => parseChartDataPoint(`${aggregatedCrowdloanBalance.raised}`))
                        .concat(sibling.data.crowdloan ? [
                            parseChartDataPoint(`${sibling.data.crowdloan?.raised}`)
                        ] : []),
                    borderColor: 'blue'
                }
            ]
        }
        return lineChartData;
    }

    useEffect(() => {
        const lineChartData = getLineChartData();
        setLineChartData(lineChartData as any);
    }, [
        own.data.aggregatedCrowdloanBalances,
        sibling.data.aggregatedCrowdloanBalances,
        chronicle.data.curBlockNum
    ])

    const lineChartOptions = {
        pointRadius: 0,
        scales: {
            x: {
                ticks: {
                    callback: (val: number, index: number) => {
                        const length = lineChartData.labels?.length;

                        return (index == ((length || 0) - 1))
                            ? (lineChartData.labels && lineChartData.labels[index])
                            : ''
                    },
                    autoSkip: false
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    }

    const chronicleEl = (<>
        <h1>Chronicle</h1>
        <button
            onClick={_ => loadChronicle()}
        >Load chronicle</button>
        <p>loading: {chronicle.loading ? "true" : "false"}</p>
        <p>curBlockNum: {chronicle.data.curBlockNum}</p>
        <p>curAuctionId: {chronicle.data.curAuctionId}</p>
    </>)

    const incentivesEl = (<>
        <h1>Incentives</h1>
        <p>HDX Bonus: {incentives.hdxBonus || '-'}</p>
        <p>BSX Multiplier: {incentives.bsxMultiplier || '-'}</p>

        <h3>Historical incentives</h3>
        {Object.keys(historicalIncentives.data).map(blockNum => (
            <div key={blockNum}>
                <p><b>{blockNum}:</b></p>
                <p>Sibling parachainId: {(historicalIncentives as any).data[blockNum]?.siblingParachainId}</p>
                <p>HDX Bonus: {(historicalIncentives as any).data[blockNum]?.hdxBonus}</p>
                <p>BSX Multiplier: {(historicalIncentives as any).data[blockNum]?.bsxMultiplier}</p>
            </div>
        ))}
    </>)

    const ownCrowdloanEl = (<>
        <h1>Own Crowdloan</h1>
        <p>Loading {own.loading ? "true" : "false"}</p>
        <p>id {own.data.crowdloan?.id}</p>
        <p>raised {own.data.crowdloan?.raised}</p>
        <p>cap {own.data.crowdloan?.cap}</p>
        <p>parachainId {own.data.crowdloan?.parachainId}</p>
        <p>blockNum {own.data.crowdloan?.blockNum}</p>
        <p>aggregated balances</p>
    </>)

    const siblingCrowdloanEl = (<>
        <h1>Sibling Crowdloan</h1>
        <p>Loading {sibling.loading ? "true" : "false"}</p>
        <p>id {sibling.data.crowdloan?.id}</p>
        <p>raised {sibling.data.crowdloan?.raised}</p>
        <p>cap {sibling.data.crowdloan?.cap}</p>
        <p>parachainId {sibling.data.crowdloan?.parachainId}</p>
        <p>blockNum {sibling.data.crowdloan?.blockNum}</p>
        <p>aggregated balances</p>

        <div style={{
            padding: '24px'
        }}>
            <Line
                id="1"
                data={lineChartData}
                type="line"
                options={lineChartOptions}
            ></Line>
        </div>
    </>)

    const accountEl = (<>
        <h1>Account</h1>
        <button onClick={_ => connectAccount()}>Connect account</button>
        <p>loading: {account.loading ? 'true' : 'false'}</p>
        <p>address: {account.data.address}</p>
        <p>balance: {account.data.balance}</p>
        <p>total KSM contributed: {totalKsmContributed}</p>
        <p>(current) HDX received: {rewardsReceived.currentHdxReceived}</p>
        <p>(current) BSX received: {rewardsReceived.currentBsxReceived}</p>
        <p>(minimal) BSX received: {rewardsReceived.minimalBsxReceived}</p>
        <p>BSX received diff: {(new BigNumber(rewardsReceived.currentBsxReceived).minus(rewardsReceived.minimalBsxReceived).toFixed(config.incentives.precision))}</p>
        <p>contributions:</p>
        <div>
            {account.data.contributions.map(contribution => (<div key={`${contribution.account}-${contribution.blockNum}`}>
                <b><p>{contribution.blockNum}</p></b>
                <p>{contribution.amount}</p>
            </div>))}
        </div>
    </>)

    return <>
        {accountEl}
        {chronicleEl}
        {incentivesEl}
        {ownCrowdloanEl}
        {siblingCrowdloanEl}

    </>
};

export default Dashboard;