import './Dashboard.scss'
import bsxEye from './../assets/Logo-dark-2-clean.png';
import bsxWallpaper from './../assets/basilisk-wallpaper-2.png';
import { CrowdloanContributeForm } from 'src/containers/CrowdloanContributeForm';
import { defaults } from 'react-chartjs-2';
import { useState } from 'react';

import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { AccountSelector } from 'src/containers/AccountSelector';
import { usePolkaDotContext } from 'src/hooks/usePolkadot';
import { useInitialData } from 'src/hooks/useInitialData';
import { useAccount, useChronicleLastProcessedBlock, useIncentives, useOwnHasWonAnAuction, useSibling } from 'src/containers/store/Store';
import { fromKsmPrecision, ksmToUsd, usdToHdx } from 'src/utils';
import millify from 'millify';
import { useAccountData } from 'src/hooks/useAccountData';
import { useChronicleData } from 'src/hooks/useChronicleData';
import { useIncentivesData } from 'src/hooks/useIncentivesData';
import { useCalculateCurrentAccountCurrentBsxReceived, useCalculateCurrentAccountMinimumBsxReceived, useCalculateCurrentAccountHdxReceived, useGlobalIncentives } from 'src/hooks/useCalculateIncentives';
import BigNumber from 'bignumber.js';
import config from 'src/config';
import { useSiblingData } from 'src/hooks/useSiblingData';

import { Graph } from './../containers/Graph';

Chart.register(annotationPlugin);

const millifyOptions = {
    // precision: config.displayPrecision,
    precision: 6,
    decimalSeparator: '.'
}

const useDashboardData = () => {
    const lastProcessedBlock = useChronicleLastProcessedBlock();


    // incentives
    const { bsxMultiplier, hdxBonus } = useGlobalIncentives();
    const currentAccountCurrentBsxReceived = useCalculateCurrentAccountCurrentBsxReceived();
    const currentAccountCurrentHdxReceived = useCalculateCurrentAccountHdxReceived()
    const ownHasWonAnAuction = useOwnHasWonAnAuction();

    // TODO: move polkadot-js data to the store
    const {
        showAccountSelector,
        setShowAccountSelector,
        activeAccount,
        activeAccountBalance
    } = usePolkaDotContext();

    const { data: { totalContributed } } = useAccount()



    return {
        // chronicle
        lastProcessedBlock,

        // polkadot-js / account
        showAccountSelector,
        setShowAccountSelector,
        activeAccount,
        activeAccountBalance,

        // account data
        totalContributed,

        // incentives
        bsxMultiplier,
        hdxBonus,
        currentAccountCurrentBsxReceived,
        currentAccountCurrentHdxReceived,
        ownHasWonAnAuction
    }
}

export const Dashboard = () => {

    const {
        // chronicle
        lastProcessedBlock,

        // polkadot-js / account
        showAccountSelector,
        setShowAccountSelector,
        activeAccount,
        activeAccountBalance,

        // account data
        totalContributed,

        // incentives
        bsxMultiplier,
        hdxBonus,
        currentAccountCurrentBsxReceived,
        currentAccountCurrentHdxReceived,
        ownHasWonAnAuction
    } = useDashboardData();

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

        {/* <div className="bsx-disclaimer">
            Basilisk is taking a temporary leave of absence, it shall return for the next batch of parachain slot auctions.
            If you've made an offering to the snekk during the auctions for slot #1 - #5, your KSM will be returned automatically by the protocol at block 8467200 (2021-07-23 10:35).
            <br/><br/> Until then, make sure to follow our <a href="https://basiliskfi.substack.com/" target="_blank">blog</a> for the latest updates regarding Basilisk.
            Stay vigilant.
        </div> */}

        <div className="bsx-account">
            <div className="container-xl">
                <div className="row bsx-account-selector-display">

                    <div className="col-9 bsx-address">
                        <div>
                            <span className="bsx-chronicle">
                                {/* {`#${lastProcessedBlock}`} */}
                                {activeAccount ? '' : 'No account connected'}
                            </span>
                            {activeAccount}
                        </div>
                    </div>
                    <div
                        className="col-3 bsx-select-account"
                        onClick={_ => setShowAccountSelector(true)}
                    >
                        { activeAccount ? "change your account" : "connect account" }
                    </div>
                </div>
                <div className="row bsx-stats">
                    <div className="col-12">
                        <div className="row">
                            <div className="col-4 bsx-stat">
                                <span className="bsx-stat-title">
                                    total ksm contributed
                                </span>
                                <span className="bsx-stat-value">
                                    {millify(parseFloat(fromKsmPrecision(totalContributed)), millifyOptions)}
                                </span>
                            </div>
                            <div className="col-4 bsx-stat">
                                <span className="bsx-stat-title">
                                    bsx reward
                                </span>
                                <span className="bsx-stat-value">
                                    {currentAccountCurrentBsxReceived
                                        ? millify(parseFloat(fromKsmPrecision(currentAccountCurrentBsxReceived)), millifyOptions)
                                        : '-'
                                    }
                                </span>
                            </div>
                            <div className="col-4 bsx-stat bsx-stat-border-right-none">
                                <span className="bsx-stat-title">
                                    hdx reward
                                </span>
                                <span className="bsx-stat-value">
                                    {millify(parseFloat(usdToHdx(ksmToUsd(fromKsmPrecision(currentAccountCurrentHdxReceived)))), millifyOptions)}
                                </span>
                            </div>   
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container-xl">
            <div className="row">
                <Graph/>
                <div className="col-3 bsx-contribute">
                    <div className="bsx-incentives">

                    <>
                        <div className="bsx-incentive">
                            <div className="row">
                                <div className="col-6 name">
                                    <span>
                                        hdx bonus
                                    </span>
                                </div>
                                <div className="col-6 value">
                                    <span>
                                    {ownHasWonAnAuction 
                                        ? '-'
                                        : hdxBonus ? hdxBonus.toFixed(2) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bsx-incentive">
                            <div className="row">
                                <div className="col-8 name">
                                    <span>
                                        bsx multiplier
                                    </span>
                                </div>
                                <div className="col-4 value">
                                    <span>
                                        {ownHasWonAnAuction
                                            ? '-'
                                            : bsxMultiplier ? bsxMultiplier.toFixed(2) : '-'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>

                        {/* {false
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
                                            {hdxBonus ? `~${hdxBonus.toFixed(2)}` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bsx-incentive">
                                    <div className="row">
                                        <div className="col-8 name">
                                            <span>
                                                bsx multiplier
                                            </span>
                                        </div>
                                        <div className="col-4 value">
                                            <span>
                                                {bsxMultiplier ? `~${bsxMultiplier.toFixed(2) }` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>)
                        } */}

                    </div>

                    <div>
                        <CrowdloanContributeForm
                            connectAccount={() => setShowAccountSelector(true)}
                            totalContributionWeight={"0"}
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
