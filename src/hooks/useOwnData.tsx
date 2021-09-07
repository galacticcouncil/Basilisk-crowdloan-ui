import { useEffect } from "react";
import { ActionType } from "src/containers/store/Actions";
import {
  LoadingState,
  useChronicleLastProcessedBlock,
  useDispatch,
  useOwn,
} from "src/containers/store/Store"
import { useFundsPledgedByParachainIdDataQuery } from "./useQueries";
import config from "src/config";

export const useOwnData = () => {
  const parachainId = config.ownParachainId;
  const lastProcessedBlock = useChronicleLastProcessedBlock();
  const dispatch = useDispatch();
  const own = useOwn();

  const [getLatestFundsPledged, latestFundsPledged] = useFundsPledgedByParachainIdDataQuery(
      parachainId || ''
  )

  // latest data
  useEffect(() => {
    if (!parachainId) return;
    if (!lastProcessedBlock) return;
    if (own.parachain.loading === LoadingState.Loading) return;

    dispatch({
      type: ActionType.LoadLatestOwnFundsPledgedData
    });
  }, [
    parachainId,
    lastProcessedBlock
  ]);

  useEffect(() => {
    if (own.parachain.loading !== LoadingState.Loading) return;
    getLatestFundsPledged()
  }, [
    own.parachain.loading
  ]);

  useEffect(() => {
    if (latestFundsPledged.loading || !latestFundsPledged.called) return;
    if (!latestFundsPledged.data) return;

    const fundsPledged = (() => {
      return latestFundsPledged.data.parachainByUniqueInput?.fundsPledged
    })()

    const hasWonAnAuction = (() => {
      return latestFundsPledged.data.parachainByUniqueInput?.hasWonAnAuction
    })()

    dispatch({
      type: ActionType.SetLatestOwnFundsPledgedData,
      payload: {
        fundsPledged,
        hasWonAnAuction
      }
    });
  }, [
    latestFundsPledged,
  ])
}
