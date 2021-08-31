import { useEffect } from "react";
import { ActionType } from "src/containers/store/Actions";
import { LoadingState, useAccount, useChronicleLastProcessedBlock, useDispatch } from "src/containers/store/Store"
import { usePolkaDotContext } from "./usePolkadot";
import { AccountByAccountIdQueryResponse, useAccountByAccountIdDataQuery, useHistoricalIncentivesByBlockHeightsDataQuery } from "./useQueries";
import { isEqual } from 'lodash';
import { LazyQueryResult, QueryResult } from "@apollo/client";
import config from "src/config";

const contributionsFromQuery = (accountByAccountIdData: LazyQueryResult<AccountByAccountIdQueryResponse, {}>) => {
    return accountByAccountIdData.data?.accountByUniqueInput?.contributions
        .filter(({ crowdloan: { id } }) => id === config.ownParachainId)
        .map(({ balance, blockHeight, crowdloan }) => ({ balance, blockHeight, crowdloan })) || [];
};

export const useAccountData = () => {
    const dispatch = useDispatch();
    const account = useAccount();
    const { activeAccount, activeAccountBalance } = usePolkaDotContext();
    const [getAccountByAccountIdData, accountByAccountIdData] = useAccountByAccountIdDataQuery(activeAccount);
    const [getHistoricalIncentivesByBlockHeightsData, historicalIncentivesByBlockHeightsData] = useHistoricalIncentivesByBlockHeightsDataQuery(
        accountByAccountIdData 
            ? contributionsFromQuery(accountByAccountIdData)
                .map(contribution => contribution.blockHeight)
            : []
    );

    const lastProcessedBlock = useChronicleLastProcessedBlock();
    
    // reload account data when the active account / active account balance changes
    useEffect(() => {
        // already loading
        if (account.loading === LoadingState.Loading) return;
        dispatch({
            type: ActionType.LoadAccountData
        });
    }, [
        activeAccount,
        activeAccountBalance,
        lastProcessedBlock
    ]);

    useEffect(() => {
        // not loading, do nothing
        if (account.loading != LoadingState.Loading) return;
        getAccountByAccountIdData();
    }, [
        account.loading
    ]);

    useEffect(() => {
        if (!accountByAccountIdData.data) return;
        getHistoricalIncentivesByBlockHeightsData();
    }, [
        accountByAccountIdData.data,
        accountByAccountIdData.loading
    ]);

    useEffect(() => {
        if (accountByAccountIdData.loading || !accountByAccountIdData.called) return;
        // if (historicalIncentivesByBlockHeightsData.loading || !historicalIncentivesByBlockHeightsData.called) return;
        
        const totalContributed = (() => {
            return accountByAccountIdData.data?.accountByUniqueInput?.totalContributed
                || '0'
        })();

        const contributions = contributionsFromQuery(accountByAccountIdData);

        const historicalIncentives = (() => {
            // TODO: figure out why .historicalIncentives being the wrong type was not caught by TS
            return historicalIncentivesByBlockHeightsData.data?.historicalIncentives || []
        })();

        dispatch({
            type: ActionType.SetAccountData,
            payload: {
                totalContributed,
                contributions,
                historicalIncentives
            }
        })
    }, [
        accountByAccountIdData,
        historicalIncentivesByBlockHeightsData
    ]);
}