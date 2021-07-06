import { ApiPromise, WsProvider } from '@polkadot/api';
import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
    web3ListRpcProviders,
    web3UseRpcProvider
  } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import config from './../config';
import constate from 'constate';
import log from 'loglevel';
import { Signer } from '@polkadot/api/types';
import BigNumber from 'bignumber.js';
import { useChronicle } from 'src/containers/store/Store';

const mockAccount = {
    // 400+ bifrost contributions from this address
    // address: 'Ge1LJP92bS9wKxKGpkBbu8LcGD5vdfugNyaqxnaZXD9edfT',
    // one bifrost contribution
    // address: "DFfX8mydSrTadbXYfLzv1vkR53awtqshNxqpSusAn63t2xe",
    // several early contribution to 2000-Gq2No2gcF6s4DLfzzuB53G5opWCoCtK9tZeVGRGcmkSDGoK
    // address: "Em9CzTD4q3zAD5gjAKS5bzUYCDq2jhLXcM66PvJvaFbmTN8",
    // 
    // address: 'Ga7qfpHpNWW2jtUCuQawANkjP1xL4dCMDkhpUbH9TgvFUB4',
    // address: "D5CVLHRhookKgoYLrszyuF4yxNPpHCFBAMZEzL7xUGtwkgG",
    address: (() => {
        let params = (new URL(document.location as unknown as string)).searchParams;
        log.debug('account', params.get('account'));
        return params.get("account");
    })() || "",
}

export const usePolkadot = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    // current active account persisted at the local storage between reloads
    // allow injecting of a mock account address
    const [activeAccount, setActiveAccount] = useLocalStorage<string>("bsx-crowdloan-account", mockAccount.address);
    const [activeAccountBalance, setActiveAccountBalance] = useState("0");
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [api, setApi] = useState<ApiPromise | undefined>(undefined)
    const [lastContributionStatus, setLastContributionStatus] = useState<boolean | undefined>(undefined);
    const chronicle = useChronicle();

    /**
     * Configure polkadot.js at the start
     */
    useEffect(() => {
        (async () => {
            log.debug('usePolkadot', 'loading initial');
            setLoading(true);
            const allInjected = await web3Enable(config.dappName);
            const allAccounts = await web3Accounts();

            const wsProvider = new WsProvider(config.nodeUrl);
            const api = await ApiPromise.create({
                provider: wsProvider
            });

            log.debug('usePolkadot', 'loaded', allInjected, api);
            setAccounts(allAccounts);
            setApi(api);
            setLoading(false);
        })()
    }, [])

    const fetchBalance = async () => {
        if (!api || !activeAccount) return;
        const { data: balance } = await api.query.system.account(activeAccount);
        log.debug('usePolkadot', 'balance', balance.free.toString());
        setActiveAccountBalance(balance.free.toString())
    }
    useEffect(() => {
        if (!activeAccount) return;
        if (!api) return
        fetchBalance();
    }, [
        activeAccount,
        api,
        chronicle.data.curBlockNum
    ]);

    const contribute = async (amount: string) => {
        if (!api) return;
        if (!activeAccount) return;
        
        setLoading(true);

        const injector = await web3FromAddress(activeAccount);

        (async () => {
            try {
                const contribute = await api.tx.crowdloan.contribute(
                    config.ownParaId,
                    new BigNumber(amount).toFixed(0),
                    null
                )
                .signAndSend(
                    activeAccount,
                    {
                        signer: injector.signer
                    }
                )
                setLastContributionStatus(true);
                fetchBalance();
            } catch (e) {
                setLastContributionStatus(false);
            }

            setLoading(false);
        })();
    }

    return {
        accounts,
        setActiveAccount,
        activeAccount,
        activeAccountBalance,
        lastContributionStatus,
        contribute
    }
}

export const [PolkadotProvider, usePolkaDotContext] = constate(usePolkadot);