import constate from "constate";
import { useAccountData } from "./useAccountData";
import { useChronicleData } from "./useChronicleData";
import { useIncentivesData } from "./useIncentivesData";
import { useInitialData } from "./useInitialData";
import { useSiblingData } from "./useSiblingData";
import { useOwnData } from "./useOwnData";

const useDashboardData = () => {
    // loads a bunch of data only once
    useInitialData();

    useAccountData();
    useChronicleData();
    useIncentivesData();
    useSiblingData();
    useOwnData();
}

export const [DashboardDataProvider, useDashboardDataContext] = constate(useDashboardData);
