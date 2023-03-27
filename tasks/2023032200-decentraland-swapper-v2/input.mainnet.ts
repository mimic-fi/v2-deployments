import { bn, DAY, fp } from '@mimic-fi/v2-helpers'

import { BOT } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
import Task from '../../src/task'

const DecentralandManaSwapper = new Task('2022121600-decentraland-mana-swapper')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1' // DCL multisig

export default {
  params: {
    smartVault: DecentralandManaSwapper.key('SmartVault'),
    tokenIn: tokens.MANA,
    tokenOut: tokens.DAI,
    maxSlippage: fp(0.005), // 0.5 %
    swapLimitToken: tokens.MANA,
    swapLimitAmount: fp(30e3),
    swapLimitPeriod: DAY,
    thresholdToken: tokens.MANA,
    thresholdAmount: fp(100),
    relayer: BOT,
    gasPriceLimit: bn(50e9),
    totalCostLimit: 0,
    payingGasToken: tokens.DAI,
    admin: owner,
  },
}
