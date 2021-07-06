const config = {
    // indexerUrl: 'http://localhost:3000',
    indexerUrl: 'https://ksm-arch.hydration.cloud/',
    // indexerUrl: 'https://api-crowdloan-basilisk.hydradx.io/ '
    nodeUrl: 'wss://ksm-arch.hydration.cloud:1144',
    dappName: 'Basilisk Crowdloan',
    // used to fetch own crowdloan & bid data for incentive calculation
    // and graph rendering
    // shiden
    // ownParachainId: '2007-Ekf4HssuTpYjmUEvzy9AAFuqpUcNm9AAkrMF1stTU6Mo1hR',
    // khala
    // ownParachainId: '2004-DaEJPYPCJQnKeHGfV6SSF8WPWtLg9zggbWwAwCZRWVPeWvv',
    // bifrost
    // ownParachainId: "2001-GLiebiQp5f6G5vNcc7BgRE9T3hrZSYDwP6evERn3hEczdaM",
    // first crowdloan registred
    // ownParachainId: "2000-Gq2No2gcF6s4DLfzzuB53G5opWCoCtK9tZeVGRGcmkSDGoK",
    ownParachainId: (() => {
        let params = (new URL(document.location as unknown as string)).searchParams;
        console.log('ownParachainId', params.get('ownParachainId'));
        return params.get("ownParachainId");
    })() || "2007-Ekf4HssuTpYjmUEvzy9AAFuqpUcNm9AAkrMF1stTU6Mo1hR",
    ownParaId: "2000",
    // used to fetch the indexer chronicle periodically
    // alternativelly plug-in polkadot.js and watch for new blocks instead
    blockTime: 6000,
    // used to fetch data newer than this block, especially for the graph
    // ownCrowdloanBlockNum: 8106771,
    ownCrowdloanBlockNum: 8204581,
    // oldest crowdloan blockNum
    // ownCrowdloanBlockNum: 7830323,
    // used to calculated incentives based on curAuctionId
    targetAuctionId: 4,

    // value lost by not staking your KSM
    ksmOpportunityCost: '0.1375',
    ksmPrecision: 12,
    // TODO: feetch ksm price dynamically
    ksmToUsd: '205.20',
    hdxToUsd: '0.0859',

    incentives: {
        precision: 50,
        hdx: {
            decimals: 12,
            scale: {
              leadPercentageDiff: {
                min: 0,
                max: 0.1
              },
              /**
               * Lower the absoulute lead percentage diff, higher the reward
               */
              rewardMultiplier: {
                min: 0.3,
                max: 0.05
              }
            },       
          },
          bsx: {
              decimals: 12,
              // 15bn with 12 decimals
              allocated: '15000000000000000000000',
              scale: {
                rewardMultiplier: {
                  min: 1,
                  max: 0,
                  // separate configuration for no incentives
                  // in case that the minimal bsx multiplier won't be 0
                  // if the incentive program changes
                  none: 0
                }
              }
          }
    },
    historicalAuctionData: {
      1: {
          blockNum: 7924237,
          closingStart: 7951237,
          closingEnd: 8023773
      },
      2: {
          blockNum: 8024552, // 779 blocks since closingEnd
          closingStart: 8051552,
          closingEnd: 8123989,
      },
      3: {
          blockNum: 8124516, // 527 blocks since closing end
          closingStart: 8151516,
          closingEnd: 8223516
      },
      4: {
        blockNum: 8224581,
        closingStart: 8251581,
        closingEnd: 8323581
    }
  }
};

export default config;