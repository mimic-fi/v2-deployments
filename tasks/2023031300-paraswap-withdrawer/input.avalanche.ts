import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/avalanche'
import Task from '../../src/task'

const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

const owner = '0xAFFdeC0FE0B5BBfd725642D87D14c465d25F8dE8' // Paraswap multisig

export default {
  params: {
    owner,
    smartVault: ParaswapFeeRedistributor.key('SmartVault'),
    recipient: owner,
    timeLock: MONTH,
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    relayer: BOT,
    gasPriceLimit: 50e9,
    txCostLimit: 0,
  },
}
