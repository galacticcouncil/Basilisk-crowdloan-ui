import { useCallback, useEffect, useState } from 'react';
import { useChronicleData, useOwnData, useSiblingData } from 'src/hooks/useData';
import { ActionType, useStoreContext, useIsLoading } from '../containers/store/Store'
import { Line, defaults } from 'react-chartjs-2';
import BigNumber from 'bignumber.js';
import config from './../config'
import { useIncentives } from 'src/hooks/useIncentives';

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

    return { chronicle, own, loadChronicle, sibling, incentives };
}

const divideKSMBy = new BigNumber(10).exponentiatedBy(12)
const parseChartDataPoint = (chartDataPoint: string) => new BigNumber(chartDataPoint)
    .dividedBy(divideKSMBy)
    .toFixed(0)

const Dashboard = () => {
    // TODO: spin the bsx eye if anything is loading?
    const loading = useIsLoading();
    // obtain data required to display the dashboard
    const { chronicle, own, loadChronicle, sibling, incentives } = useDashboardData();

    // testing chart stuff
    const [lineChartData, setLineChartData] = useState({
        labels: [],
        datasets: []
    })

    const getLineChartData = useCallback(() => {
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
                        ] : [])
                },
                {
                    label: 'sibling',
                    data: sibling.data.aggregatedCrowdloanBalances
                        ?.map(aggregatedCrowdloanBalance => parseChartDataPoint(`${aggregatedCrowdloanBalance.raised}`))
                        .concat(sibling.data.crowdloan ? [
                            parseChartDataPoint(`${sibling.data.crowdloan?.raised}`)
                        ] : [])
                }
            ]
        }
        return lineChartData;
    }, [
        own.loading,
        own.data.aggregatedCrowdloanBalances,
        sibling.loading,
        sibling.data.aggregatedCrowdloanBalances
    ])

    useEffect(() => {
        if (own.loading || sibling.loading) return;
        console.log('getLineChartData', sibling.data.aggregatedCrowdloanBalances)
        const lineChartData = getLineChartData();
        setLineChartData(lineChartData as any);
    }, [
        own.data.aggregatedCrowdloanBalances,
        sibling.data.aggregatedCrowdloanBalances,
        sibling.loading,
        own.loading
    ])

    const lineChartOptions = {
        pointRadius: 0,
        scales: {
            x: {
                ticks: {
                   callback: (val: number, index: number) => {
                       const length = lineChartData.labels?.length;
                       
                       return (index == ((length || 0 ) - 1))
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
                display: false
            }
        }
    }

    const chronicleEl = (<>
        <button
            onClick={_ => loadChronicle()}
        >Load chronicle</button>
        <h1>Chronicle</h1>
        <p>loading: {chronicle.loading ? "true" : "false"}</p>
        <p>curBlockNum: {chronicle.data.curBlockNum}</p>
        <p>curAuctionId: {chronicle.data.curAuctionId}</p>
    </>)

    const incentivesEl = (<>
        <h1>Incentives</h1>
        <p>HDX Bonus: {incentives.hdxBonus?.toFixed(5) || '-'}</p>
        <p>BSX Multiplier: {incentives.bsxMultiplier?.toFixed(5) || '-'}</p>
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

    return <>
        <p>Dashboard loading: {loading ? "true" : "false"}</p>
        {chronicleEl}
        {incentivesEl}
        {ownCrowdloanEl}
        {siblingCrowdloanEl}
        
    </>
};

export default Dashboard;