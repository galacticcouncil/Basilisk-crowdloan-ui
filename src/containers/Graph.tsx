
import {useMemo, useState} from "react";
import { Line } from "react-chartjs-2";
import { fromKsmPrecision } from "src/utils";
import { useChronicle, useOwn, useSibling } from "./store/Store";
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import millify from 'millify';
import { defaults } from 'react-chartjs-2';
import config from "../config";
import simpleLinearScale from "simple-linear-scale";
import {useKeyPress} from "react-use";


Chart.register(annotationPlugin);

const millifyOptions = {
    // precision: config.displayPrecision,
    precision: 6,
    decimalSeparator: '.'
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

    const { data: { lastProcessedBlock, mostRecentAuctionClosingStart, mostRecentAuctionStart } } = useChronicle();

    const isLineChartDataLoading = false;

    const [snek, setSnek] = useState<boolean | undefined>(undefined);
    const up = (event: any) => event.keyCode === 38;
    const [snakeTime] = useKeyPress(up)
    if (snakeTime && !snek) {
        setSnek(true);
    }

    const createDataset = (historicalData: any[]) => historicalData
        ?.map(({blockHeight, fundsPledged}) => ({x: parseInt(blockHeight), y: fromKsmPrecision(fundsPledged)}));

    const ownDataset = createDataset(ownHistoricalFundsPledged);
    const siblingsDataset = createDataset(siblingHistoricalFundsPledged);

    const labels = siblingsDataset.map(({x}: any) => parseInt(x));

    const lineChartData = {
        labels,
        datasets: [
                // {
                //     labels,
                //     label: 'Sibling', // todo replace with real sibling name from mapping or at least paraId
                //     borderColor: colors.yellow,
                //     yAxisID: 'crowdloanCap',
                //     data: siblingsDataset,
                // },
                {
                    label: 'Basilisk',
                    borderColor: colors.green,
                    yAxisID: 'crowdloanCap',
                    data: ownDataset,
                }
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

    // x axis seems to be scaled using the count of labels, instead of blockHeights
    // TODO: figure out how to scale blockheight directly in the graph
    const xAnnotationScale = simpleLinearScale(
        [
            labels[0],
            labels[labels.length - 1],
        ],
        [
            0,
            labels.length
        ]
    );

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
                    max: 270000,
                    min: 0
                },
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
                        // siblingRaised: siblingFundsPledged ? {
                        //     type: 'line',
                        //     borderWidth: 1,
                        //     borderDash: [3, 3],
                        //     scaleID: 'crowdloanCap',
                        //     // TODO: .toFixed(0) first
                        //     value: fromKsmPrecision(siblingFundsPledged),
                        //     borderColor: colors.yellow,
                        //     label: {
                        //         ...labelOptions,
                        //         xAdjust: -8,
                        //         backgroundColor: colors.yellow,
                        //         content: millify(parseFloat(fromKsmPrecision(siblingFundsPledged)), millifyOptions),
                        //     }
                        // } : null,

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

                        // closingStart: mostRecentAuctionClosingStart ? {
                        //     type: 'line',
                        //     scaleID: 'x',
                        //     value: xAnnotationScale(mostRecentAuctionClosingStart),
                        //     borderColor: colors.red,
                        //     borderWidth: 3,
                        //     borderDash: [3, 3],
                        //     label: {
                        //         ...labelOptions,
                        //         position: 'start',
                        //         backgroundColor: colors.red,
                        //         content: 'auction closing',
                        //         xAdjust: 0,
                        //         yAdjust: 20,

                        //     }
                        // } : null,

                        // closingEnd: mostRecentAuctionClosingStart ? {
                        //     type: 'line',
                        //     scaleID: 'x',
                        //     value: xAnnotationScale(parseInt(mostRecentAuctionClosingStart) + 72000),
                        //     borderColor: colors.white,
                        //     borderWidth: 3,
                        //     borderDash: [3, 3],
                        //     label: {
                        //         ...labelOptions,
                        //         position: 'start',
                        //         backgroundColor: colors.white,                                
                        //         content: 'auction end',
                        //         xAdjust: 0,
                        //         yAdjust: 20,
                                
                        //     }
                        // } : null,

                        // auctionStart: mostRecentAuctionStart ? {
                        //     type: 'line',
                        //     value: xAnnotationScale(mostRecentAuctionStart),
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
                        // } : null
                    },
                },
            }
        }
    }, [
        ownFundsPledged,
        siblingFundsPledged,
        lastProcessedBlock,
        mostRecentAuctionClosingStart,
        labels
    ])

    const renderGraph = () => {
        if (snek) {
            return <iframe src="snek/game.html" id="gameIframe" className="gameIframe" width="100%" height="100%"></iframe>;
        } else {
            return (
                <>
                    <div className="bsx-graph-loader">
                        Crowdloan cap has been reached, <br/> brace for impact.
                    </div>
                    
                    <Line
                        id="1"
                        type="line"
                        data={lineChartData}
                        options={lineChartOptions}
                    />
                </>
            );
        }
    };

    return <>
        <div className="col-9 bsx-graph">
            <div className="bsx-graph-wrapper">
                {renderGraph()}
                

            </div>
            <div className="bsx-graph-timeline">
                <div className="row">
                    <div className="col-3">
                        28.8
                    </div>
                    <div className="col-6 bsx-legend">
                        <span className="basilisk">Basilisk</span> 
                        {/* / <span className="sibling">Target</span> */}
                        <span> KSM raised</span>
                    </div>
                    <div className="col-3">
                        22.9
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
