import './Dashboard.scss'
import bsxEye from './../assets/Logo-dark-2-clean.png';
import bsxWallpaper from './../assets/basilisk-wallpaper-2.png';
import { CrowdloanContributeForm } from 'src/containers/CrowdloanContributeForm';
import { Line, defaults } from 'react-chartjs-2';
import { ActionType, useChronicle, useStoreContext } from 'src/containers/store/Store';
import { useChronicleData, useOwnData, useSiblingData } from 'src/hooks/useData';
import { useMemo, useEffect, useState } from 'react';
import { range, times } from 'lodash';
import config from 'src/config';
import { calculateBsxMultiplier } from 'src/incentives/calculateBsxMultiplier';
import { fromKsmPrecision, usdToHdx, ksmToUsd } from 'src/utils';
import millify from 'millify';
import linearScale from 'simple-linear-scale'

import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useIncentives } from 'src/hooks/useIncentives';
import { useAccountData, useTotalKsmContributed } from 'src/hooks/useAccountData';
import BigNumber from 'bignumber.js';
import { AccountSelector } from 'src/containers/AccountSelector';
Chart.register(annotationPlugin);

const millifyOptions = {
    precision: 6
}

defaults.animation = false;

const colors = {
    yellow: '#ffe733',
    red: '#ff5033',
    orange: '#ff8133',
    green: '#90ff33',
    black: '#171b22',
    white: '#ebebeb',
    faintGray: 'rgba(181, 149, 114, .1)',
    transparent: 'transparent',
}

export const useDashboardData = () => {
    let { dispatch } = useStoreContext();
    let { chronicle } = useChronicleData();
    let { own, ownLoading } = useOwnData();
    let { sibling, siblingLoading } = useSiblingData();
    let incentives = useIncentives();
    const accountData = useAccountData();
    const totalKsmContributed = useTotalKsmContributed();

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

    const isDashboardEssentialDataLoading = useMemo(() => {
        return !own.data.crowdloan || !sibling.data.crowdloan
    }, [own.data, sibling.data])

    return {
        chronicle,
        own,
        sibling,
        isDashboardEssentialDataLoading,
        incentives,
        accountData
    }
}

export const Dashboard = () => {

    const { 
        chronicle, 
        own, 
        sibling, 
        isDashboardEssentialDataLoading,
        incentives,
        accountData,
    } = useDashboardData();

    const [showAccountSelector, setShowAccountSelector] = useState(false);

    const aggregationCoeficient = 50;
    const targetAuctionId = config.targetAuctionId;
    const targetAuction = (config.historicalAuctionData as any)[targetAuctionId];
    const labels = range(
        config.ownCrowdloanBlockNum,
        targetAuction.closingEnd,
        aggregationCoeficient
    );
    const lineChartBlockNumScale = linearScale(
        [
            config.ownCrowdloanBlockNum,
            targetAuction.closingEnd,
        ],
        [
            0,
            (targetAuction.closingEnd - config.ownCrowdloanBlockNum) / aggregationCoeficient,
        ]
    )

    const progressBarScale = linearScale(
        [
            config.ownCrowdloanBlockNum,
            targetAuction.closingEnd,
        ],
        [
            0,
            100,
        ]
    )

    const lineChartData = useMemo(() => {
        
        const emptyLineChartData = {
            labels,
            datasets: []
        };

        // if (own.loading || sibling.loading) return emptyLineChartData;

        return ({
            labels,
            datasets: [
                {
                    label: 'Basilisk',
                    borderColor: colors.green,
                    yAxisID: 'crowdloanCap',
                    data: own.data.aggregatedCrowdloanBalances
                        ?.map(aggregatedCrowdloanBalance => fromKsmPrecision(`${aggregatedCrowdloanBalance.raised}`))
                        .concat(own.data.crowdloan ? [
                            fromKsmPrecision(`${own.data.crowdloan?.raised}`)
                        ] : [])
                },
                {
                    label: 'Sibling', // todo replace with real sibling name from mapping or at least paraId
                    borderColor: colors.yellow,
                    yAxisID: 'crowdloanCap',
                    data: sibling.data.aggregatedCrowdloanBalances
                        ?.map(aggregatedCrowdloanBalance => fromKsmPrecision(`${aggregatedCrowdloanBalance.raised}`))
                        .concat(sibling.data.crowdloan ? [
                            fromKsmPrecision(`${sibling.data.crowdloan?.raised}`)
                        ] : [])
                },
                {
                    label: 'BSX Multiplier',
                    yAxisID: 'bsxMultiplier',
                    borderColor: colors.transparent,
                    backgroundColor: colors.faintGray,
                    fill: true,
                    data: labels
                            .map(blockNum => {
                                return calculateBsxMultiplier(
                                    blockNum,
                                    targetAuctionId,
                                    targetAuction.closingStart,
                                    targetAuction.closingEnd
                                )
                            })
                }
            ]
        })
    }, [
        own.data,
        own.loading,
        sibling.data,
        sibling.loading,
    ])

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
                        auctionStart: {
                            type: 'line',
                            value: lineChartBlockNumScale(targetAuction.blockNum),
                            borderColor: colors.orange,
                            borderWidth: 3,
                            borderDash: [3, 3],
                            scaleID: 'x',
                            label: {
                                ...labelOptions,
                                position: 'start',
                                backgroundColor: colors.orange,                                
                                content: 'auction starting',
                                xAdjust: 0,
                                yAdjust: 20,
                                
                            }
                        },
                        closingStart: {
                            type: 'line',
                            value: lineChartBlockNumScale(targetAuction.closingStart),
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
                                xAdjust: 0,
                                yAdjust: 20,
                                
                            }
                        },
                        now: chronicle.data.curBlockNum ? {
                            type: 'line',
                            value: lineChartBlockNumScale(chronicle.data.curBlockNum),
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
                        ownRaised: own.data.crowdloan?.raised ? {
                            type: 'line',
                            value: fromKsmPrecision(own.data.crowdloan.raised),
                            borderColor: colors.green,
                            borderWidth: 1,
                            borderDash: [3, 3],
                            scaleID: 'crowdloanCap',
                            label: {
                                ...labelOptions,
                                content: millify(parseFloat(fromKsmPrecision(own.data.crowdloan.raised)), millifyOptions),
                            }
                        } : null,
                        siblingRaised: sibling.data.crowdloan?.raised ? {
                            type: 'line',
                            borderWidth: 1,
                            borderDash: [3, 3],
                            scaleID: 'crowdloanCap',
                            // TODO: .toFixed(0) first
                            value: fromKsmPrecision(sibling.data.crowdloan.raised),
                            borderColor: colors.yellow,
                            label: {
                                ...labelOptions,
                                backgroundColor: colors.yellow,
                                content: millify(parseFloat(fromKsmPrecision(sibling.data.crowdloan.raised)), millifyOptions),
                            }
                        } : null
                    },
                },
            }
        }
    }, [
        own.data.crowdloan?.raised,
        sibling.data.crowdloan?.raised,
        chronicle.data.curBlockNum
    ])

    const isLineChartDataLoading = useMemo(() => isDashboardEssentialDataLoading, [
        isDashboardEssentialDataLoading
    ]);

    return <div className='bsx-dashboard'>

        <div className="bsx-navbar">
            <div className="container-xl">
                <div className="row">
                    <div className="col-3">
                        <div className="bsx-logo">
                            basilisk
                        </div>
                    </div>
                    <div className="col-9 bsx-menu-col">

                        <div className="bsx-menu">
                            <div className="bsx-menu-item">
                                <a href="https://bsx.fi/" target="_blank">
                                    home
                                </a>
                            </div>
                            <div className="bsx-menu-item">
                                <a href="https://discord.gg/S8YZj5aXR6" target="_blank">
                                    discord
                                </a>
                            </div>
                            <div className="bsx-eye">
                                <img src={bsxEye}/>
                            </div>
                            <div className="bsx-menu-item">
                                <a href="https://github.com/galacticcouncil/Basilisk-node" target="_blank">
                                    github
                                </a>
                            </div>
                            <div className="bsx-menu-item">
                                <a href="https://docs.bsx.fi/" target="_blank">
                                    docs
                                </a>
                            </div>
                            <div className="bsx-menu-item">
                                <a href="https://basiliskfi.substack.com/" target="_blank">
                                    blog
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div className="bsx-disclaimer">
            We're currently investigating issues related to our infrastructure, which may affect displaying of your past contributions and rewards.
            However all of your past contributions have been recorded on-chain, and are completely safe. 

            Your rewards can be retrospectively calculated from existing on-chain data, using the <a href="https://basiliskfi.substack.com/p/basilisk-crowdloan-kick-off" target="_blank">information provided in this article</a>. Stay vigilant.
        </div>

        <div className="bsx-account">
            <div className="container-xl">
                <div className="row bsx-account-selector-display">
                    
                    <div className="col-9 bsx-address">
                        <div>
                            <span className="bsx-chronicle">
                                {`#${chronicle.data.curBlockNum}`}
                                {accountData.account.data.address ? ` / ` : ''}  
                            </span> 

                            {accountData.account.data.address}
                        </div>
                    </div>
                    <div 
                        className="col-3 bsx-select-account"
                        onClick={_ => setShowAccountSelector(true)}    
                    >
                        change your account
                    </div>
                </div>
                <div className="row bsx-stats">
                    <div className="col-9">
                        <div className="row">
                            <div className="col-3 bsx-stat">
                                <span className="bsx-stat-title">
                                    total ksm contributed
                                </span>
                                <span className="bsx-stat-value">
                                    ~{millify(parseFloat(fromKsmPrecision(accountData.totalKsmContributed)), millifyOptions)}
                                </span>
                            </div>
                            <div className="col-3 bsx-stat">
                                <span className="bsx-stat-title">
                                    minimal bsx received
                                </span>
                                <span className="bsx-stat-value">
                                    ~{millify(parseFloat(fromKsmPrecision(accountData.rewardsReceived.minimalBsxReceived)), millifyOptions)}
                                </span>
                            </div>
                            <div className="col-3 bsx-stat">
                                <span className="bsx-stat-title">
                                    current bsx received
                                </span>
                                <span className="bsx-stat-value">
                                    ~{millify(parseFloat(fromKsmPrecision(accountData.rewardsReceived.currentBsxReceived)), millifyOptions)}
                                </span>
                            </div>
                            <div className="col-3 bsx-stat">
                                <span className="bsx-stat-title">
                                    current hdx reward
                                </span>
                                <span className="bsx-stat-value">
                                    ~{millify(parseFloat(usdToHdx(ksmToUsd(fromKsmPrecision(accountData.rewardsReceived.currentHdxReceived)))), millifyOptions)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-3 bsx-stat bsx-stat-balance">
                        <span className="bsx-stat-title">
                            balance
                        </span>
                        <span className="bsx-stat-value">
                            ~{millify(parseFloat(fromKsmPrecision(accountData.account.data.balance)), millifyOptions)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    
        <div className="container-xl">
            <div className="row">
                <div className="col-9 bsx-graph">
                    <div className="bsx-graph-wrapper">
                             
                        <div className="bsx-annotation-container"></div>

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
                                05.07
                            </div>
                            <div className="col-6 bsx-legend">
                                <span className="basilisk">Basilisk</span> / <span className="sibling">Target</span> KSM raised
                            </div>
                            <div className="col-3">
                                13.07
                            </div>
                        </div>
                        <div className="bsx-progress-bar-container">
                            <div className="bsx-progress-bar" style={{
                                width: `${progressBarScale(chronicle.data.curBlockNum)}%`
                            }}></div>
                        </div>
                    </div>
                </div>
                <div className="col-3 bsx-contribute">
                    <div className="bsx-incentives">
                        
                        {isDashboardEssentialDataLoading
                            ? (<>
                                <div className="bsx-incentives-loader">
                                    Caluculating incentives...
                                </div>
                            </>)
                            : (<>
                                <div className="bsx-incentive">
                                    <div className="row">
                                        <div className="col-6 name">
                                            <span>
                                                hdx bonus
                                            </span>
                                        </div>
                                        <div className="col-6 value">
                                            <span>
                                            ~{incentives.hdxBonus
                                                    ? (new BigNumber(incentives.hdxBonus).toFixed(2))
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
    
                                <div className="bsx-incentive">
                                    <div className="row">
                                        <div className="col-9 name">
                                            <span>
                                                bsx multiplier
                                            </span>
                                        </div>
                                        <div className="col-3 value">
                                            <span>
                                                ~{incentives.bsxMultiplier
                                                    ? (new BigNumber(incentives.bsxMultiplier).toFixed(2))
                                                    : '-'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>)
                        }

                    </div>

                    <div>
                        <CrowdloanContributeForm
                            totalContributionWeight={accountData.rewardsReceived.totalContributionWeight}
                            connectAccount={() => setShowAccountSelector(true)}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="bsx-wallpaper">
            <img src={bsxWallpaper}/>
        </div>

        {showAccountSelector ? <AccountSelector
            onAccountSelect={() => setShowAccountSelector(false)}
        /> : <></>}
    </div>
}