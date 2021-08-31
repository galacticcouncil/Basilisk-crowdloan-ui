
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { fromKsmPrecision } from "src/utils";
import { useChronicle, useOwn, useSibling } from "./store/Store";
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import millify from 'millify';
import { defaults } from 'react-chartjs-2';


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

    const { data: { lastProcessedBlock } } = useChronicle();

    const isLineChartDataLoading = false;

    const createDataset = (historicalData: any[]) => historicalData
        ?.map(({blockHeight, fundsPledged}) => ({x: blockHeight, y: fromKsmPrecision(fundsPledged)}));

    const ownDataset = createDataset(ownHistoricalFundsPledged);
    const siblingsDataset = createDataset(siblingHistoricalFundsPledged);

    const labels = siblingsDataset.map(({x}: any) => x);

    const lineChartData = {
        labels,
        datasets: [
                {
                    labels,
                    label: 'Sibling', // todo replace with real sibling name from mapping or at least paraId
                    borderColor: colors.yellow,
                    yAxisID: 'crowdloanCap',
                    data: siblingsDataset,
                },
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



    const lineChartOptions = useMemo(() => {
        return {
            pointRadius: 0,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                  display: false
                },
                crowdloanCap: {
                    type: 'linear',
                    position: 'left',
                    display: false,
                    max: 200000,
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
                        28.8
                    </div>
                    <div className="col-6 bsx-legend">
                        <span className="basilisk">Basilisk</span> / <span className="sibling">Target</span> KSM raised
                    </div>
                    <div className="col-3">
                        NOW
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
