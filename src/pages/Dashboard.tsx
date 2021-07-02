import { useCallback, useEffect } from 'react';
import { useChronicleData, useOwnData } from 'src/hooks/data';
import { ActionType, useStoreContext, useIsLoading } from '../containers/store/Store'
import { Line, defaults } from 'react-chartjs-2';
import millify from 'millify'
import BigNumber from 'bignumber.js';

defaults.animation = false;

const useDashboardData = () => {
    let { state, dispatch } = useStoreContext();
    let { chronicle } = useChronicleData();
    let { own } = useOwnData()

    const loadDashboardData = () => {
        [
            ActionType.LoadChronicle,
            ActionType.LoadOwnData
        ].forEach(action => dispatch({
            type: action
        }))
    }

    useEffect(() => loadDashboardData(), [])

    useEffect(() => {
        console.log('setup interval')
        const intervalId = setInterval(() => {
            console.log('loading chronicle')
            dispatch({
                type: ActionType.LoadChronicle
            })
        }, 4000)

        return () => clearInterval(intervalId)
    }, [])

    return { chronicle, own };
}

const divideKSMBy = new BigNumber(10).exponentiatedBy(12)
const parseChartDataPoint = (chartDataPoint: string) => new BigNumber(chartDataPoint)
    .dividedBy(divideKSMBy)
    .toFixed(0)

const Dashboard = () => {
    const loading = useIsLoading();
    const { chronicle, own } = useDashboardData();

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
                }
            ]
        }
        return lineChartData;
    }, [
        own.data.aggregatedCrowdloanBalances,
        own.data.crowdloan?.raised,
        chronicle.data.curBlockNum
    ])

    const getLineChartOptions = () => ({
        pointRadius: 0,
        scales: {
            x: {
                ticks: {
                   callback: (val: number, index: number) => {
                       const lineChartData = getLineChartData()
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
    })

    return <>
        <p>Dashboard loading: {loading ? "true" : "false"}</p>
        <h1>Chronicle</h1>
        <p>loading: {chronicle.loading ? "true" : "false"}</p>
        <p>curBlockNum: {chronicle.data.curBlockNum}</p>

        <h1>Own Crowdloan</h1>
        <p>Loading {own.loading ? "true" : "false"}</p>
        <p>id {own.data.crowdloan?.id}</p>
        <p>raised {own.data.crowdloan?.raised}</p>
        <p>cap {own.data.crowdloan?.cap}</p>
        <p>parachainId {own.data.crowdloan?.parachainId}</p>
        <p>aggregated balances</p>
        
        <div style={{
            padding: '24px'
        }}>
            {own.loading 
                ? '-'
                : (<Line 
                        data={getLineChartData()}
                        type="line"
                        options={getLineChartOptions()}
                    ></Line>)
            }
        </div>
        
    </>
};

export default Dashboard;