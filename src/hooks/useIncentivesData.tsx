import log from "loglevel";
import { useEffect } from "react"
import { ActionType } from "src/containers/store/Actions";
import { LoadingState, useChronicleLastProcessedBlock, useDispatch, useIncentives, useInitializedAtBlockHeight, useIsInitialDataLoaded } from "src/containers/store/Store";
import { useIncentivesDataQuery } from "./useQueries";

export const useIncentivesData = () => {
    
    const lastProcessedBlock = useChronicleLastProcessedBlock();
    const isInitialDataLoaded = useIsInitialDataLoaded();
    const initializedAtBlockHeight = useInitializedAtBlockHeight();
    const dispatch = useDispatch();
    const incentives = useIncentives();

    const [getIncentivesData, incentivesData] = useIncentivesDataQuery();

    useEffect(() => {
        // do not reload incentives unless the initial data has been already fetched
        // or if the lastProcessedBlock is 0
        if (!isInitialDataLoaded || !lastProcessedBlock) return;
        if (lastProcessedBlock === initializedAtBlockHeight) return;
        dispatch({
            type: ActionType.LoadIncentiveData
        });
    }, [
        isInitialDataLoaded,
        lastProcessedBlock,
        initializedAtBlockHeight
    ]);

    useEffect(() => {
        if (incentives.loading !== LoadingState.Loading) return;
        getIncentivesData();
    }, [
        incentives.loading
    ]);

    useEffect(() => {
        if (incentivesData.loading || !incentivesData.called) return;
        if (!incentivesData.data) return;
        // TODO: query response parsers are duplicate with initial data, needs to be unified
        const incentives = (() => {
            const { leadPercentageRate, totalContributionWeight, siblingParachain } = incentivesData.data?.incentiveByUniqueInput || {
                leadPercentageRate: '0',
                totalContributionWeight: '0',
            };

            return { 
                leadPercentageRate, 
                totalContributionWeight,
                siblingParachain: { id: siblingParachain?.id }
            };
        })();
        
        dispatch({
            type: ActionType.SetIncentiveData,
            payload: incentives
        })
    }, [
        incentivesData
    ]);
}