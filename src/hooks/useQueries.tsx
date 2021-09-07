import { gql, useLazyQuery } from "@apollo/client";
import config from './../config';

const chronicleId = 'chronicle';
const chronicleByUniqueInput = `
    chronicleByUniqueInput(where: {id: "${chronicleId}"}) {
        lastProcessedBlock
        mostRecentAuctionClosingStart
        mostRecentAuctionStart
    }
`

const historicalFundsPledgedByParachainIdSinceBlockHeight = (parachainId: string, blockHeight: string) => `
    historicalParachainFundsPledgeds(where: {parachain: {id_eq: "${parachainId}"}, blockHeight_gte: "${blockHeight}"}, limit: 1000) {
        fundsPledged
        blockHeight
    }
`

// duplicate but parametrized via the query instead
const _historicalFundsPledgedByParachainIdSinceBlockHeight = `
    historicalParachainFundsPledgeds(where: {parachain: {id_eq: $parachainId}, blockHeight_gte: $blockHeight}, limit: 1000) {
        fundsPledged
        blockHeight
    }
`

const fundsPledgedByParachainId = `
    parachainByUniqueInput(where: {id: $parachainId}) {
        fundsPledged
    }
`

// query MyQuery($parachainId: ID!, $blockHeight: BigInt!) {
//     historicalParachainFundsPledgeds(where: {parachain: {id_eq: $parachainId}, blockHeight_gte: $blockHeight}) {
//        fundsPledged
//        blockHeight
//    }
// }
const historicalFundsPledgedByParachainIdSinceBlockHeightDataQuery = gql`
    query HistoricalFundsPledged($parachainId: ID!, $blockHeight: BigInt!) {
        ${_historicalFundsPledgedByParachainIdSinceBlockHeight}
    }
`

const fundsPledgedByParachainIdDataQuery = gql`
    query FundsPledged($parachainId: ID!) {
        ${fundsPledgedByParachainId}
    }
`

const parachainFundsPledgedByParachainId = (parachainId: string) => `
    parachainByUniqueInput(where: {id: "${parachainId}"}) {
        fundsPledged,
        hasWonAnAuction
    }
`

const incentiveId = 'incentive';
const incentives = `
    incentiveByUniqueInput(where: {id: "${incentiveId}"}) {
        totalContributionWeight
        leadPercentageRate,
        siblingParachain {
            id
        }
    }
`

const initialDataQuery = gql`
    query InitialData {
        ${chronicleByUniqueInput}
        ${historicalFundsPledgedByParachainIdSinceBlockHeight(
            config.ownParachainId,
            config.ownCrowdloanBlockHeight
        )}
        ${parachainFundsPledgedByParachainId(
            config.ownParachainId
        )}
        ${incentives}
    }
`

const accountByAccountId = `
    accountByUniqueInput(where: {id: $accountId}) {
        totalContributed
        contributions {
            crowdloan {
                id
            }
            blockHeight
            balance
        }
    }
`

const historicalIncentivesByBlockHeights = `
    historicalIncentives(where: {blockHeight_in: $blockHeights}) {
        blockHeight
        leadPercentageRate
    }
`

const historicalIncentivesByBlockHeightsDataQuery = gql`
    query HistoricalIncentives($blockHeights: [BigInt!]) {
        ${historicalIncentivesByBlockHeights}
    }
`

const accountByAccountIdDataQuery = gql`
    query ContributionsByAccountId($accountId: ID!) {
        ${accountByAccountId}
    }
`
const chronicleDataQuery = gql`
    query Chronicle {
        ${chronicleByUniqueInput}
    }
`

const incentivesDataQuery = gql`
    query Incentives {
        ${incentives}
    }
`

export type Chronicle = {
    lastProcessedBlock: string,
    mostRecentAuctionStart: string | undefined,
    mostRecentAuctionClosingStart: string | undefined
}

export type HistoricalParachainFundsPledged = {
    fundsPledged: string,
    blockHeight: string
}

export type ParachainDetails = {
    fundsPledged: string,
    hasWonAnAuction: boolean
}

export type Incentives = {
    leadPercentageRate: string,
    totalContributionWeight: string,
    siblingParachain: {
        id: string | undefined
    }
}

export type HistoricalIncentive = {
    blockHeight: string,
    leadPercentageRate: string,
}

type InitialDataQueryResponse = {
    chronicleByUniqueInput: Chronicle,
    historicalParachainFundsPledgeds: HistoricalParachainFundsPledged[],
    parachainByUniqueInput: ParachainDetails,
    incentiveByUniqueInput: Incentives | undefined
};
export const useInitialDataQuery = () => useLazyQuery<InitialDataQueryResponse>(initialDataQuery);

export type Contribution = {
    blockHeight: string,
    balance: string,
    crowdloan: {
        id: string
    }
};

export type Account = {
    totalContributed: string,
    contributions: Contribution[],
}

export type AccountByAccountIdQueryResponse = {
    accountByUniqueInput: Account
};

export const useAccountByAccountIdDataQuery = (accountId: string) => useLazyQuery<AccountByAccountIdQueryResponse>(accountByAccountIdDataQuery, {
    variables: {
        accountId
    }
});

type ChronicleQueryResponse = {
    chronicleByUniqueInput: Chronicle
}

export const useChronicleDataQuery = () => useLazyQuery<ChronicleQueryResponse>(chronicleDataQuery);

type IncentivesQueryResponse = {
    incentiveByUniqueInput: Incentives | undefined
}

export const useIncentivesDataQuery = () => useLazyQuery<IncentivesQueryResponse>(incentivesDataQuery);

type HistoricalIncentivesByBlockHeightsQueryResponse = {
    historicalIncentives: HistoricalIncentive[]
}

export const useHistoricalIncentivesByBlockHeightsDataQuery = (blockHeights: string[]) => useLazyQuery<HistoricalIncentivesByBlockHeightsQueryResponse>(historicalIncentivesByBlockHeightsDataQuery, {
    variables: { blockHeights }
})

type HistoricalFundsPledgedByParachainIdQueryResponse = {
    historicalParachainFundsPledgeds: HistoricalParachainFundsPledged[]
}

export const useHistoricalFundsPledgedByParachainIdDataQuery = (parachainId: string, blockHeight: string) => useLazyQuery<HistoricalFundsPledgedByParachainIdQueryResponse>(historicalFundsPledgedByParachainIdSinceBlockHeightDataQuery, {
    variables: { parachainId, blockHeight }
})

type FundsPledgedByParachainIdQueryResponse = {
    parachainByUniqueInput: ParachainDetails
}

export const useFundsPledgedByParachainIdDataQuery = (parachainId: string) => useLazyQuery<FundsPledgedByParachainIdQueryResponse>(fundsPledgedByParachainIdDataQuery, {
    variables: { parachainId }
})
