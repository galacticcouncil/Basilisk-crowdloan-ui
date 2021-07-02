import { gql, useLazyQuery, useQuery } from "@apollo/client";
import config from '../config';

// fetch only data newer than this block in some cases
const ownCrowdloanBlockNum = 0;

/**
 * Queries
 */
const chronicleKey = "ChronicleKey"

const chronicle = `
    chronicle(id: "${chronicleKey}") {
        curBlockNum
        curAuctionId
    }
`

export const chronicleQuery = gql`
    query chronicle {
        ${chronicle}
    }
`

const crowdloanFields = `
    nodes{
        id,
        cap,
        raised,
        parachainId,
        blockNum
    }
`

export const ownCrowdloan = gql`
    query ownCrowdloan($ownParachainId: String) {
        crowdloans(filter: {
            parachainId: {
                equalTo: $ownParachainId
            }
        }){
            ${crowdloanFields}
        }
    }
`

export const getAggregatedCrowdloanBalances = gql`
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
 * Hooks
 */
export const useChronicle = () => {
    return useLazyQuery(chronicleQuery)
}

export const useOwnCrowdloan = () => useLazyQuery(ownCrowdloan, {
    variables: {
        ownParachainId: config.ownParachainId
    }
})

export const useAggregatedCrowdloanBalancesByParachainId = (variables: any) => {
    return useLazyQuery(getAggregatedCrowdloanBalances, { 
        variables: {
            onlySignificant: true,
            // minBlockNum should be since our crowdloan started (crowdloan.blockNum)
            minBlockNum: ownCrowdloanBlockNum,
            ...variables
        }
    }) 
}

export const useOwnAggregatedCrowdloanBalances = (variables: any = {}) => useAggregatedCrowdloanBalancesByParachainId({
    parachainId: config.ownParachainId,
    ...variables
})