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
    })() || "D5CVLHRhookKgoYLrszyuF4yxNPpHCFBAMZEzL7xUGtwkgG",
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
            console.log('allAccount', allAccounts);
            setAccounts(allAccounts);
            setApi(api);
            setLoading(false);
        })()
    }, [])

    useEffect(() => {
        if (!activeAccount) return;
        if (!api) return
        
        (async () => {
            const { data: balance } = await api.query.system.account(activeAccount);
            log.debug('usePolkadot', 'balance', balance.free.toString());
            setActiveAccountBalance(balance.free.toString())
        })();
    }, [
        activeAccount,
        api
    ]);

    const contribute = async (amount: string) => {
        if (!api) return;
        if (!activeAccount) return;
        
        setLoading(true);
        console.log('running api contribute', amount, api, activeAccount);

        const injector = await web3FromAddress(activeAccount)
        console.log('api crowdloan', api.tx.crowdloan.contribute);
        (async () => {
            try {
                const contribute = await api.tx.crowdloan.contribute(
                    config.ownParaId,
                    amount,
                    null
                )
                .signAndSend(
                    activeAccount,
                    {
                        signer: injector.signer
                    }
                )
                console.log('contribute', activeAccount, injector.signer);
                setLastContributionStatus(true);
            } catch (e) {
                setLastContributionStatus(false);
                console.log('error sending contribution', e);
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