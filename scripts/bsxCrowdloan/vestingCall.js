const vestings = require("./data/vestings.json")
const batchVest = require('../batch-vesting/batchVestingCall')

batchVest(vestings)
