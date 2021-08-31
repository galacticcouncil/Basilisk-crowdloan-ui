import BigNumber from "bignumber.js";
import { range, times } from "lodash";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import config from "src/config";
import { calculateBsxMultiplier } from "src/hooks/useCalculateIncentives";
import { fromKsmPrecision } from "src/utils";
import { useChronicle, useOwn, useSibling } from "./store/Store";
import { Chart, LinearScale } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import millify from 'millify';
import { defaults } from 'react-chartjs-2';
import linearScale from "simple-linear-scale";


Chart.register(annotationPlugin);

const millifyOptions = {
    // precision: config.displayPrecision,
    precision: 6,
    decimalSeparator: ','
}

defaults.animation = false;

const colors = {
    yellow: '#ffe733',
    red: '#ff5033',
    orange: '#ff8133',
    green: '#90ff33',
    white: '#ebebeb',
    black: '#171b22',
    faintGray: 'rgba(181, 149, 114, .1)',
    transparent: 'transparent',
}

export const Graph = () => {
    const sibling = useSibling();
    const { siblingHistoricalFundsPledged, siblingFundsPledged } = (() => {
        const { historicalFundsPledged, parachain: { data: { fundsPledged } } } = sibling;
        return {
            siblingHistoricalFundsPledged: historicalFundsPledged.data,
            siblingFundsPledged: fundsPledged
        }
    })();

    const own = useOwn();
    const { ownHistoricalFundsPledged, ownFundsPledged } = (() => {
        const { historicalFundsPledged, parachain: { data: { fundsPledged } } } = own;
        return {
            ownHistoricalFundsPledged: historicalFundsPledged.data,
            ownFundsPledged: fundsPledged
        }
    })();

    const { data: { mostRecentAuctionClosingStart, lastProcessedBlock } } = useChronicle();

    const isLineChartDataLoading = false;

    // console.log('sibling data', siblingFundsPledged, siblingHistoricalFundsPledged);

    // 8979298 - 9080098
    const chartStart = config.ownCrowdloanBlockHeight;
    const graphEndBlockHeight = new BigNumber(chartStart)
        .plus(config.chart.blocksPerDay * 7)
        .toNumber();

    const lineChartLabels = useMemo(() => {
        return range(
            // own crowdloan start - 2 days
            chartStart,
            graphEndBlockHeight,
            config.chart.historicalDataSpan
        )
        .concat([parseInt(lastProcessedBlock)]);
    }, [])

    const lineChartBlockNumScale = linearScale(
        [
            chartStart,
            graphEndBlockHeight,
        ],
        [
            0,
            // (targetAuction.closingEnd - config.ownCrowdloanBlockNum) / aggregationCoeficient,
            // (config.chart.auctionClosingStart + config.auctionEndingPeriodLength)
            lineChartLabels.length
        ]
    )
    
    console.log('chart')
    console.log('labels', lineChartLabels);
    console.log('ownData', ownHistoricalFundsPledged);
    console.log('siblingData', siblingHistoricalFundsPledged);

    const ownFundsPledgedWithOffset = (() => {
        if (!ownHistoricalFundsPledged) return [];
        if (!ownHistoricalFundsPledged[ownHistoricalFundsPledged.length - 1]) return [];
        const lastOwnHistoricalDataBlockHeight = ownHistoricalFundsPledged[ownHistoricalFundsPledged.length - 1]?.blockHeight;
        const diffFromLastBlockToLastHistorical = new BigNumber(lastProcessedBlock)
            .minus(
                new BigNumber(
                    lastOwnHistoricalDataBlockHeight
                )
            )
            .dividedBy(config.chart.historicalDataSpan)
            .toFixed(0);
    
            console.log('diffFromLastBlock', diffFromLastBlockToLastHistorical)

        return (times(parseInt(diffFromLastBlockToLastHistorical), () => null) as any[])
            .concat([
                fromKsmPrecision(ownFundsPledged)
            ])
    })();

    const siblingFundsPledgedWithOffset = (() => {
        if (!siblingHistoricalFundsPledged) return [];
        if (!siblingHistoricalFundsPledged[siblingHistoricalFundsPledged.length - 1]) return [];
        const lastSiblingHistoricalDataBlockHeight = siblingHistoricalFundsPledged[siblingHistoricalFundsPledged.length - 1]?.blockHeight;
        const diffFromLastBlockToLastHistorical = new BigNumber(lastProcessedBlock)
            .minus(
                new BigNumber(
                    lastSiblingHistoricalDataBlockHeight
                )
            )
            .dividedBy(config.chart.historicalDataSpan)
            .toFixed(0);
    
            console.log('diffFromLastBlock', diffFromLastBlockToLastHistorical)

        return (times(parseInt(diffFromLastBlockToLastHistorical), () => null) as any[])
            .concat([
                fromKsmPrecision(siblingFundsPledged)
            ])
    })();

    console.log('ownFundsPledgedWithOffset', ownFundsPledgedWithOffset);
    const ownLineChartData = ownHistoricalFundsPledged
        ?.map(({ blockHeight, fundsPledged }) => fromKsmPrecision(fundsPledged))
        .concat(ownFundsPledged ? ownFundsPledgedWithOffset : [])


    const siblingLineChartData = siblingHistoricalFundsPledged
        ?.map(({ blockHeight, fundsPledged }) => fromKsmPrecision(fundsPledged))
        .concat(siblingFundsPledged ? siblingFundsPledgedWithOffset : [])

    const lineChartData = {
        labels: lineChartLabels,
        datasets: [
                {
                    label: 'Basilisk',
                    borderColor: colors.green,
                    yAxisID: 'crowdloanCap',
                    data: ownLineChartData,
                    spanGaps: true,
                },
                {
                    label: 'Sibling', // todo replace with real sibling name from mapping or at least paraId
                    borderColor: colors.yellow,
                    yAxisID: 'crowdloanCap',
                    data: siblingLineChartData,
                    spanGaps: true,
                },
                // {
                //     label: 'BSX Multiplier',
                //     yAxisID: 'bsxMultiplier',
                //     borderColor: colors.transparent,
                //     backgroundColor: colors.faintGray,
                //     fill: true,
                //     data: lineChartLabels
                //             .map(blockHeight => {
                //                 return calculateBsxMultiplier(
                //                     blockHeight.toString(),
                //                     mostRecentAuctionClosingStart
                //                 )
                //             })
                // }
        ]
    }

    const labelOptions = {
        backgroundColor: colors.green,
        position: 'end',
        enabled: true,
        color: colors.black,
        font: {
            family: 'Pexico',
            size: 12
        },
        xAdjust: 10,
        cornerRadius: 0,
    }



    const lineChartOptions = useMemo(() => {
        return {
            pointRadius: 0,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false,
                },
                crowdloanCap: {
                    type: 'linear',
                    position: 'left',
                    display: false,
                    max: 200000,
                    min: 0
                },
                bsxMultiplier: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    max: 1.7,
                    min: 0
                }
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                legend: {
                    display: false
                },
                autocolors: false,
                annotation: {
                    annotations: {
                        // auctionStart: {
                        //     type: 'line',
                        //     value: lineChartBlockNumScale(targetAuction.blockNum),
                        //     borderColor: colors.orange,
                        //     borderWidth: 3,
                        //     borderDash: [3, 3],
                        //     scaleID: 'x',
                        //     label: {
                        //         ...labelOptions,
                        //         position: 'start',
                        //         backgroundColor: colors.orange,                                
                        //         content: 'auction starting',
                        //         xAdjust: -10,
                        //         yAdjust: 20,
                                
                        //     }
                        // },
                        closingStart: {
                            type: 'line',
                            value: lineChartBlockNumScale(config.chart.auctionClosingStart),
                            // value: 100000,
                            // xMin: chronicle.data.curBlockNum,
                            // xMax: chronicle.data.curBlockNum,
                            borderColor: colors.red,
                            borderWidth: 3,
                            borderDash: [3, 3],
                            scaleID: 'x',
                            label: {
                                ...labelOptions,
                                position: 'start',
                                backgroundColor: colors.red,                                
                                content: 'auction closing',
                                xAdjust: 10,
                                yAdjust: 20,
                                xPadding: 30,
                            }
                        },
                        now: lastProcessedBlock ? {
                            type: 'line',
                            // value: lineChartBlockNumScale(chronicle.data.curBlockNum),
                            value: lineChartBlockNumScale(lastProcessedBlock),
                            // value: 100000,
                            // xMin: chronicle.data.curBlockNum,
                            // xMax: chronicle.data.curBlockNum,
                            borderColor: colors.white,
                            borderWidth: 3,
                            borderDash: [3, 3],
                            scaleID: 'x',
                            label: {
                                ...labelOptions,
                                position: 'start',
                                backgroundColor: colors.white,                                
                                content: 'now',
                                xAdjust: 0,
                                yAdjust: 60,
                                
                            }
                        } : null,
                        
                        siblingRaised: siblingFundsPledged ? {
                            type: 'line',
                            borderWidth: 1,
                            borderDash: [3, 3],
                            scaleID: 'crowdloanCap',
                            // TODO: .toFixed(0) first
                            value: fromKsmPrecision(siblingFundsPledged),
                            borderColor: colors.yellow,
                            label: {
                                ...labelOptions,
                                xAdjust: -8,
                                backgroundColor: colors.yellow,
                                content: millify(parseFloat(fromKsmPrecision(siblingFundsPledged)), millifyOptions),
                            }
                        } : null,

                        ownRaised: ownFundsPledged ? {
                            type: 'line',
                            value: fromKsmPrecision(ownFundsPledged),
                            borderColor: colors.green,
                            borderWidth: 1,
                            borderDash: [3, 3],
                            scaleID: 'crowdloanCap',
                            label: {
                                ...labelOptions,
                                xAdjust: -116,
                                content: millify(parseFloat(fromKsmPrecision(ownFundsPledged)), millifyOptions),
                            }
                        } : null,
                    },
                },
            }
        }
    }, [
        ownFundsPledged,
        siblingFundsPledged,
        lastProcessedBlock
    ])

    return <>
        <div className="col-9 bsx-graph">
            <div className="bsx-graph-wrapper">
                        
                <div className="bsx-annotation-container"></div>
{/* 
                <div className="bsx-graph-loader">
                    Snek is sleeping, for now.
                </div> */}

                {isLineChartDataLoading
                    ? (
                        <div className="bsx-graph-loader">
                            Fetching graph data...
                        </div>
                    )
                    : (
                        <Line
                            id="1"
                            type="line"
                            data={lineChartData}
                            options={lineChartOptions}
                        />
                    )
                }
                
            </div>
            <div className="bsx-graph-timeline">
                <div className="row">
                    <div className="col-3">
                        19.8
                    </div>
                    <div className="col-6 bsx-legend">
                        <span className="basilisk">Basilisk</span> / <span className="sibling">Target</span> KSM raised
                    </div>
                    <div className="col-3">
                        23.07
                    </div>
                </div>
                <div className="bsx-progress-bar-container">
                    <div className="bsx-progress-bar" style={{
                        // width: `${progressBarScale(chronicle.data.curBlockNum)}%`
                        width: '0%'
                    }}></div>
                </div>
            </div>
        </div>
    </>
}