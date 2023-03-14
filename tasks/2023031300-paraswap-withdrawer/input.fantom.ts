import { MONTH, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/fantom'
import Task from '../../src/task'

const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x5487683dc3216655D0C8AA31255e2e313b99B477' // Paraswap multisig

export default {
  params: {
    owner,
    smartVault: ParaswapFeeRedistributor.key('SmartVault'),
    recipient: owner,
    timeLock: MONTH,
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    relayer: BOT,
    gasPriceLimit: 300e9,
    txCostLimit: 0,
  },
}
