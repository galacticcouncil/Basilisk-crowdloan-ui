import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import config from "src/config";
import { ActionType, useStoreContext, useAccount, useChronicle, useContributions } from "src/containers/store/Store"
import { useContributionsByAccountAndParachainId } from "./useQueries";
import log from 'loglevel';

const mockAccount = {
    // 400+ bifrost contributions from this address
    // address: 'Ge1LJP92bS9wKxKGpkBbu8LcGD5vdfugNyaqxnaZXD9edfT',
    // one bifrost contribution
    // address: "DFfX8mydSrTadbXYfLzv1vkR53awtqshNxqpSusAn63t2xe",
    // several early contribution to 2000-Gq2No2gcF6s4DLfzzuB53G5opWCoCtK9tZeVGRGcmkSDGoK
    // address: "Em9CzTD4q3zAD5gjAKS5bzUYCDq2jhLXcM66PvJvaFbmTN8",
    // 
    // address: 'Ga7qfpHpNWW2jtUCuQawANkjP1xL4dCMDkhpUbH9TgvFUB4',
    address: "D5CVLHRhookKgoYLrszyuF4yxNPpHCFBAMZEzL7xUGtwkgG",
    // address: (() => {
    //     let params = (new URL(document.location as unknown as string)).searchParams;
    //     log.debug('account', params.get('account'));
    //     return params.get("account");
    // })() || "Ga7qfpHpNWW2jtUCuQawANkjP1xL4dCMDkhpUbH9TgvFUB4",
    balance: '123456789'
}

const useContributionsData = (address: string | null) => {
    const chronicle = useChronicle();
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
    // intermediate account state for fetching of contributions
    const [intermediateAccount, setIntermediateAccount] = useState({
        address: "",
        balance: "",
        loading: false
    });
    const accountContributions = useContributionsData(intermediateAccount.address);

    const connectAccount = () => {
        log.debug('useAccountData', 'connecting account')
        dispatch({
            type: ActionType.ConnectAccount
        })
        setIntermediateAccount({
            ...intermediateAccount,
            address: mockAccount.address,
            loading: true
        })
    };

    useEffect(() => {
        // reload account balance with every block & address change
        if (!intermediateAccount.address) return;
        log.debug('useAccountData', 'reloading balance')
        setIntermediateAccount({
            loading: true,
            address: intermediateAccount.address,
            balance: mockAccount.balance
        })
    }, [
        chronicle.data.curBlockNum,
        intermediateAccount.address
    ]);

    // connect to the wallet using polkadot.js
    useEffect(() => {
        if (!intermediateAccount.loading) return;
        log.debug('useAccountData', 'account ready')
        setIntermediateAccount({
            ...mockAccount,
            loading: false
        })
    }, [
        account.loading,
        intermediateAccount,
        setIntermediateAccount
    ])

    useEffect(() => {
        if (intermediateAccount.loading) return;
        if (accountContributions.loading) return;
        if (!accountContributions.data) return;

        log.debug('useAccountData', 'setting account data')
        dispatch({
            type: ActionType.SetAccountData,
            payload: {
                address: intermediateAccount.address,
                balance: intermediateAccount.balance,
                contributions: accountContributions.data
            }
        })
    }, [
        intermediateAccount,
        accountContributions.data,
        accountContributions.loading,
        dispatch,
    ])

    return {
        connectAccount,
        account,
        contributions
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