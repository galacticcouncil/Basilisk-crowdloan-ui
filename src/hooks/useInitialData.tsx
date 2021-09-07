import BigNumber from "bignumber.js";
import { initial } from "lodash";
import log from "loglevel";
import { useEffect } from "react";
import { precisionMultiplierBN } from "src/config";
import { ActionType } from "src/containers/store/Actions";
import { useDispatch, useIsInitialDataLoaded, useIsInitialDataLoading } from "src/containers/store/Store"
import { useInitialDataQuery } from "./useQueries";

export const useInitialData = () => {
    const dispatch = useDispatch();
    const isInitialDataLoading = useIsInitialDataLoading();
    const isInitialDataLoaded = useIsInitialDataLoaded();
    const [getInitialData, initialData] = useInitialDataQuery()

    // load initial data only once
    useEffect(() => {
        log.debug('useInitialData', 'loading')
        dispatch({
            type: ActionType.LoadInitialData
        })
    }, []);

    // if the store says we should be loading, start loading
    useEffect(() => {
        if (!isInitialDataLoading || isInitialDataLoaded) return;
        getInitialData();
    }, [
        isInitialDataLoading
    ]);

    useEffect(() => {
        if (initialData.loading || !initialData.called) return;
        if (!initialData.data) return;
        if (!isInitialDataLoading) return;

        const chronicle = (() => {
            const { 
                lastProcessedBlock,
                mostRecentAuctionStart,
                mostRecentAuctionClosingStart,
            } = initialData.data?.chronicleByUniqueInput || {
                lastProcessedBlock: '0',
            };

            return { 
                lastProcessedBlock,
                mostRecentAuctionStart,
                mostRecentAuctionClosingStart,
            };
        })();

        const ownHistoricalFundsPledged = (() => initialData.data.historicalParachainFundsPledgeds
            .map(({ fundsPledged, blockHeight }: { [key: string]: string }) => ({ fundsPledged, blockHeight }))
        )();

        const ownParachain= (() => initialData.data.parachainByUniqueInput)();

        const incentives = (() => {
            const { leadPercentageRate, totalContributionWeight, siblingParachain } = initialData.data?.incentiveByUniqueInput || {
                leadPercentageRate: '0',
                totalContributionWeight: '0'
            };

            return { 
                leadPercentageRate, 
                totalContributionWeight,
                siblingParachain: {
                    id: siblingParachain?.id
                }
            };
        })();

        log.debug('useInitialData', 'done loading', { 
            chronicle, 
            ownHistoricalFundsPledged, 
            ownParachain,
            incentives
        });

        dispatch({
            type: ActionType.SetInitialData,
            payload: { 
                chronicle, 
                ownHistoricalFundsPledged, 
                ownParachain,
                incentives
            }
        });
    }, [
        initialData.data,
        isInitialDataLoading
    ])
}