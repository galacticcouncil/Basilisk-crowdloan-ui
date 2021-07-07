import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import config from "src/config";
import { ActionType, useStoreContext, useAccount, useChronicle, useContributions } from "src/containers/store/Store"
import { useContributionsByAccountAndParachainId } from "./useQueries";
import { useCalculateRewardsReceived } from 'src/hooks/useIncentives';
import log from 'loglevel';
import { useLocalStorage } from 'react-use';
import { usePolkaDotContext } from "./usePolkadot";
import {encodeAddress,decodeAddress } from '@polkadot/util-crypto';

const useContributionsData = () => {
    const chronicle = useChronicle();
    const account = useAccount();
    const address = account.data.address ? encodeAddress(decodeAddress(account.data.address), 2) : "";

    const [getContributionsByAccountAndParachainId, contributionsByAccountAndParachainId] = useContributionsByAccountAndParachainId(
        address || "",
        config.ownParachainId
    );
    const [accountContributions, setAccountContributions] = useState([]);

    useEffect(() => {
        if (!address) return;
        if (!chronicle.data.curBlockNum) return;
        log.debug('useContributionsData', 'getContributionsByAccountAndParachainId', 'called')
        getContributionsByAccountAndParachainId();
    }, [
        chronicle.data.curBlockNum,
        getContributionsByAccountAndParachainId,
        address,
    ]);

    useEffect(() => {
        if (!contributionsByAccountAndParachainId.called || contributionsByAccountAndParachainId.loading) return;
        if (!contributionsByAccountAndParachainId.data) return;
        
        log.debug('useContributionsData', 'getContributionsByAccountAndParachainId', 'loaded', contributionsByAccountAndParachainId);
        const accountContributions = contributionsByAccountAndParachainId.data.contributions.nodes.map((contribution: any) => ({
            account: contribution.account,
            amount: contribution.amount,
            blockNum: contribution.blockNum,
            parachainId: contribution.parachainId
        }));
        setAccountContributions(accountContributions);
    }, [
        contributionsByAccountAndParachainId
    ])

    return { 
        data: accountContributions,
        loading: contributionsByAccountAndParachainId.loading,
        called: contributionsByAccountAndParachainId.loading,
        getContributionsByAccountAndParachainId: getContributionsByAccountAndParachainId
    }
}

const useAccountData = () => {
    const { dispatch } = useStoreContext()
    const account = useAccount();
    const chronicle = useChronicle();
    const contributions = useContributions();
    const rewardsReceived = useCalculateRewardsReceived();
    const {
        activeAccount,
        activeAccountBalance,
    } = usePolkaDotContext()

    const accountContributions = useContributionsData();
    const totalKsmContributed = useTotalKsmContributed()

    // TODO: fix loading state
    useEffect(() => {
        dispatch({
            type: ActionType.ConnectAccount
        })
    }, [
        activeAccount
    ])

    useEffect(() => {
        if (!activeAccount) return;
        if (!activeAccountBalance) return;
        if (accountContributions.loading) return;

        console.log("accdataset", accountContributions.data)

        log.debug('useAccountData', 'setting account data', activeAccount, activeAccountBalance)
        dispatch({
            type: ActionType.SetAccountData,
            payload: {
                address: activeAccount,
                balance: activeAccountBalance,
                contributions: accountContributions.data
            }
        })
    }, [
        activeAccount,
        activeAccountBalance,
        accountContributions.loading,
        accountContributions.data,
        dispatch,
    ])

    return {
        account,
        contributions,
        rewardsReceived,
        totalKsmContributed
    }
}

const useTotalKsmContributed = () => {
    log.debug('useTotalKsmContributed');
    const account = useAccount();
    const totalKsmContributed = account.data.contributions.reduce((accumulator, { amount }) => {
        return new BigNumber(accumulator)
            .plus(
                new BigNumber(amount)
            ).toFixed(0)
    }, "0");

    log.debug('useTotalKsmContributed', totalKsmContributed);
    return totalKsmContributed;
}

export {
    useAccountData,
    useTotalKsmContributed
}