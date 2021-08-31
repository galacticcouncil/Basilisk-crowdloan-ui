import log from "loglevel";
import { useEffect } from "react"
import config from "src/config";
import { ActionType } from "src/containers/store/Actions";
import { LoadingState, useChronicle, useDispatch } from "src/containers/store/Store"
import { Chronicle, useChronicleDataQuery } from "./useQueries";

export const useChronicleData = () => {
    
    const dispatch = useDispatch();
    const chronicle = useChronicle();
    const [getChronicleData, chronicleData] = useChronicleDataQuery();

    // fetch chronicle every few seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            log.debug('useChronicleData', 'fetching chronicle')
            dispatch({
                type: ActionType.LoadChronicleData
            })
        }, config.chronicleRefetchTimeout);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (chronicle.loading != LoadingState.Loading) return;
        getChronicleData();
    }, [
        chronicle.loading
    ]);

    useEffect(() => {
        if (chronicleData.loading || !chronicleData.called) return;
        const _chronicle: Chronicle = (() => ({
            // TODO: use defaults from the store
            lastProcessedBlock: chronicleData.data?.chronicleByUniqueInput.lastProcessedBlock || '0',
            mostRecentAuctionStart: chronicleData.data?.chronicleByUniqueInput.mostRecentAuctionStart,
            mostRecentAuctionClosingStart: chronicleData.data?.chronicleByUniqueInput.mostRecentAuctionClosingStart
        }))();

        dispatch({
            type: ActionType.SetChronicleData,
            payload: _chronicle
        })
    }, [
        chronicleData
    ])
}
