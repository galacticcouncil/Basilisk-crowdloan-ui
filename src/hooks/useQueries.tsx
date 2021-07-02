import { gql, useLazyQuery } from "@apollo/client";
import config from '../config';

export type Auction = {
    closingStart: null | number,
    closingEnd: null | number
}

export type Chronicle = {
    curBlockNum:  number,
    curAuctionId: null | number,
    curAuction: Auction
}

export type Crowdloan = {
    id: string,
    // KSM cap
    cap: number,
    // KSM raised
    raised: number,
    // parachainId which the crowdloan belongs to
    parachainId: string,
    // blockNum when the crowdloan was registred, NOT when it was last updated
    blockNum: number
}

export type AggregatedCrowdloanBalance = {
    id: string,
    // blockNum for which the data was aggregated
    blockNum: number,
    // snapshot of KSM raised at the given blockNum
    raised: number,
    parachainId: string
}

// fetch only data newer than this block in some cases
// TODO: replace with real blockNum when the BSX crowdloan starts
const ownCrowdloanBlockNum = 0;

/**
 * Queries
 */
// ID of the chronicle in the indexer db
const chronicleKey = "ChronicleKey"
const chronicle = `
    chronicle(id: "${chronicleKey}") {
        curBlockNum
        curAuctionId,
        curAuction {
            closingStart,
            closingEnd
        }
    }
`

// query to fetch the chronicle
export const getChronicleQuery = gql`
    query chronicle {
        ${chronicle}
    }
`

// which crowdloan fields to fetch at any query involving a crowdloan
const crowdloanFields = `
    nodes{
        id,
        cap,
        raised,
        parachainId,
        blockNum
    }
`

// query to fetch a crowdloan that matches the ownParachainId
export const getCrowdloanByParachainIdQuery = gql`
    query ownCrowdloan($parachainId: String) {
        crowdloans(filter: {
            parachainId: {
                equalTo: $parachainId
            }
        }){
            ${crowdloanFields}
        }
    }
`

// query to fetch aggregated crowdloan balances for the given parachainId
export const getAggregatedCrowdloanBalancesByParachainIdQuery = gql`
    query getAggregatedCrowdloanBalances($parachainId: String, $onlySignificant: Boolean, $minBlockNum: Int) {
        aggregatedCrowdloanBalances(
            filter: { 
                parachainId: { equalTo: $parachainId },
                isSignificant: { equalTo: $onlySignificant }
                blockNum: {
                    greaterThanOrEqualTo: $minBlockNum
                }
            },
            orderBy: BLOCK_NUM_ASC
        ) {
            nodes {
                id,
                blockNum,
                raised,
                parachainId
            }
        }
    }
`

/**
 * Query to fetch the sibling crowdloan candidates.
 * Fetching the top two largest crowdloans, that are not ours,
 * allows us to either determine by what margin we are loosing, or winning.
 */
export const getSiblingCrowdloanCandidatesQuery = gql`
    query siblingCrowdloanCandidates($ownParachainId: String) {
        crowdloans(
            filter: { parachainId: { notEqualTo: $ownParachainId } }
            first: 2
            orderBy: RAISED_DESC
        ) {
            nodes {
                blockNum
                id
                raised
                parachainId
            }
        }
    }
`

/**
 * Hooks
 */
// hook to fetch the latest indexer chronicle
export const useChronicleQuery = () => useLazyQuery(getChronicleQuery)

export const useCrowdloanByParachainIdQuery = (parachainId: string) => useLazyQuery(getCrowdloanByParachainIdQuery, {
    variables: {
        parachainId
    }
})

// hook to fetch our own crowdloan
export const useOwnCrowdloanQuery = () => useCrowdloanByParachainIdQuery(config.ownParachainId);

// hook to fetch aggregated crowdloan balances by parachain id
export const useAggregatedCrowdloanBalancesByParachainIdQuery = (variables: any) => useLazyQuery(getAggregatedCrowdloanBalancesByParachainIdQuery, { 
    variables: {
        onlySignificant: true,
        // minBlockNum should be since our crowdloan started (crowdloan.blockNum)
        minBlockNum: ownCrowdloanBlockNum,
        ...variables
    }
});

// hook to fetch aggregated crowdloan balances using ownParachainId
export const useOwnAggregatedCrowdloanBalancesQuery = (variables: any = {}) => useAggregatedCrowdloanBalancesByParachainIdQuery({
    parachainId: config.ownParachainId,
    ...variables
});

export const useSiblingCrowdloanCandidatesQuery = () => useLazyQuery(getSiblingCrowdloanCandidatesQuery, {
    variables: {
        ownParachainId: config.ownParachainId
    }
})