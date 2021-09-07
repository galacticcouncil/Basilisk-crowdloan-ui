import { ApiPromise, WsProvider } from '@polkadot/api';
import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
  } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import config from '../config';
import constate from 'constate';
import log from 'loglevel';
import { Signer } from '@polkadot/api/types';
import BigNumber from 'bignumber.js';
import {encodeAddress,decodeAddress } from '@polkadot/util-crypto';
import { useChronicle } from 'src/containers/store/Store';

const mockAccount = {
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
    let [activeAccount, setActiveAccount] = useLocalStorage<string>("bsx-crowdloan-account", mockAccount.address);
    activeAccount = activeAccount ? encodeAddress(decodeAddress(activeAccount), 2) : "";

    const [activeAccountBalance, setActiveAccountBalance] = useState("0");
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [api, setApi] = useState<ApiPromise | undefined>(undefined)
    const [lastContributionStatus, setLastContributionStatus] = useState<boolean | undefined>(undefined);

    const chronicle = useChronicle()

    /**
     * Configure polkadot.js at the start
     */
    useEffect(() => {
        setTimeout(async () => {
            log.debug('usePolkadot', 'loading initial');
            setLoading(true);
            const allInjected = await web3Enable(config.dappName);
            const allAccounts = (await web3Accounts())
                .map(account => ({
                    ...account,
                    address: encodeAddress(decodeAddress(account.address), 2)
                }))

            const wsProvider = new WsProvider(config.nodeUrl);
            const api = await ApiPromise.create({
                provider: wsProvider
            });

            log.debug('usePolkadot', 'loaded', allInjected, api, allAccounts);
            setAccounts(allAccounts);
            setApi(api);
            setLoading(false);
        }, 300);
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
        chronicle.data.lastProcessedBlock
    ]);

    const contribute = async (amount: string) => {
        if (!api) return;
        if (!activeAccount) return;
        
        setLoading(true);

        const { signer } = await web3FromAddress(activeAccount);

        (async () => {
            try {
                api.tx.crowdloan.contribute(
                    config.ownParachainId,
                    new BigNumber(amount).toFixed(0),
                    null
                )
                .signAndSend(
                    activeAccount,
                    { signer },
                    ({ status, events }) => {
                        if (status.isInBlock || status.isFinalized) {
                            events
                                .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
                                .length
                                ? setLastContributionStatus(false)
                                : setLastContributionStatus(true);
                        }
                    }
                )
                fetchBalance();
            } catch (e) {
                console.error(e);
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
        showAccountSelector,
        setShowAccountSelector,
        contribute
    }
}

export const [PolkadotProvider, usePolkaDotContext] = constate(usePolkadot);