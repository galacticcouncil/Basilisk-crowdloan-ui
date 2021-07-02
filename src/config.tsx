const config = {
    indexerUrl: 'http://localhost:3000',
    // used to fetch own crowdloan & bid data for incentive calculation
    // and graph rendering
    ownParachainId: '2007-Ekf4HssuTpYjmUEvzy9AAFuqpUcNm9AAkrMF1stTU6Mo1hR',
    // used to fetch the indexer chronicle periodically
    // alternativelly plug-in polkadot.js and watch for new blocks instead
    blockTime: 6000,
    // used to calculated incentives based on curAuctionId
    targetAuctionId: 1,
    incentives: {
        hdx: {
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
            }
          },
          bsx: {
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
    }
};
export default config;