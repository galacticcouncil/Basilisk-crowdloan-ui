import { useEffect, useState } from "react";
import { usePrevious, usePreviousDistinct } from "react-use";
import config from "src/config";
import { ActionType } from "src/containers/store/Actions";
import { LoadingState, useChronicleLastProcessedBlock, useDispatch, useIncentives, useInitializedAtBlockHeight, useIsInitialDataLoaded, useSibling, useSiblingParachainId } from "src/containers/store/Store"
import { useFundsPledgedByParachainIdDataQuery, useHistoricalFundsPledgedByParachainIdDataQuery } from "./useQueries";

export const useSiblingData = () => {
    const siblingParachainId = useSiblingParachainId();
    const lastProcessedBlock = useChronicleLastProcessedBlock();
    const isInitialDataLoaded = useIsInitialDataLoaded();
    const initializedAtBlockHeight = useInitializedAtBlockHeight();
    const dispatch = useDispatch();
    const sibling = useSibling();
    const [previousSiblingParachainId, setPreviousSiblingParachainId] = useState(siblingParachainId);

    const [getSiblingHistoricalFundsPledged, siblingHistoricalFundsPledged] = useHistoricalFundsPledgedByParachainIdDataQuery(
        siblingParachainId || '',
        config.ownCrowdloanBlockHeight
    )

    const [getLatestFundsPledged, latestFundsPledged] = useFundsPledgedByParachainIdDataQuery(
        siblingParachainId || ''
    )

    // historical data
    useEffect(() => {
        if (!siblingParachainId) return;
        if (siblingParachainId === previousSiblingParachainId) return;
        if (sibling.historicalFundsPledged.loading === LoadingState.Loading) return;
        setPreviousSiblingParachainId(siblingParachainId);
        dispatch({
            type: ActionType.LoadHistoricalSiblingFundsPledgedData
        });
    }, [
        siblingParachainId,
        previousSiblingParachainId,
        setPreviousSiblingParachainId
    ]);

    useEffect(() => {
        if (!sibling.historicalFundsPledged.loading) return;
        if (siblingHistoricalFundsPledged.loading) return;
        if (sibling.historicalFundsPledged.loading !== LoadingState.Loading) return;
        getSiblingHistoricalFundsPledged();
    }, [
        sibling.historicalFundsPledged.loading,
        siblingHistoricalFundsPledged
    ])

    useEffect(() => {
        // cant erase historical data
        if (!siblingHistoricalFundsPledged.data) return;
        if (sibling.historicalFundsPledged.loading !== LoadingState.Loading) return;
        if (siblingHistoricalFundsPledged.loading || !siblingHistoricalFundsPledged.called) return;

        const historicalFundsPledged = (() => {
            return siblingHistoricalFundsPledged.data.historicalParachainFundsPledgeds
        })();

        dispatch({
            type: ActionType.SetHistoricalSiblingFundsPledgedData,
            payload: historicalFundsPledged
        })
    }, [
        siblingHistoricalFundsPledged
    ])


    // latest data
    useEffect(() => {
        if (!siblingParachainId) return;
        if (!lastProcessedBlock) return;
        if (sibling.parachain.loading === LoadingState.Loading) return;

        dispatch({
            type: ActionType.LoadLatestSiblingFundsPledgedData
        });
    }, [
        siblingParachainId,
        lastProcessedBlock
    ]);

    useEffect(() => {
        if (sibling.parachain.loading !== LoadingState.Loading) return;
        getLatestFundsPledged()
    }, [
        sibling.parachain.loading
    ]);

    useEffect(() => {
        if (latestFundsPledged.loading || !latestFundsPledged.called) return;
        // if (sibling.parachain.loading !== LoadingState.Loading) return;
        if (!latestFundsPledged.data) return;

        const fundsPledged = (() => {
            return latestFundsPledged.data.parachainByUniqueInput?.fundsPledged
        })()

        const hasWonAnAuction = (() => {
            return latestFundsPledged.data.parachainByUniqueInput?.hasWonAnAuction
        })()

        dispatch({
            type: ActionType.SetLatestSiblingFundsPledgedData,
            payload: {
                fundsPledged,
                hasWonAnAuction
            }
        });
    }, [
        latestFundsPledged,
    ])
}
