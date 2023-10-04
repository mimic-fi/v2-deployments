import { BigNumberish, fp, HOUR, toUSDC } from '@mimic-fi/v2-helpers'

import * as hop from '../../constants/hop'
import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v1',
  from: DEPLOYER_2,
  owner: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  polygon: {
    PermissionsManager: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
    l2HopBridger: {
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.02), // 2%
      maxBonderFeePct: fp(0.05), // 5%
      destinationChainId: 1,
      hopAmmParams: [{ token: tokens.polygon.WETH, amm: hop.polygon.ETH_AMM }],
      thresholdToken: tokens.polygon.USDC,
      thresholdAmount: toUSDC(500),
      gasPriceLimit: 200e9,
    },
  },
  optimism: {
    PermissionsManager: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
    l2HopBridger: {
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.02), // 2%
      maxBonderFeePct: fp(0.05), // 5%
      destinationChainId: 1,
      hopAmmParams: [{ token: tokens.optimism.WETH, amm: hop.optimism.ETH_AMM }],
      thresholdToken: tokens.optimism.USDC,
      thresholdAmount: toUSDC(500),
      gasPriceLimit: 0.5e9,
    },
  },
  arbitrum: {
    PermissionsManager: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
    l2HopBridger: {
      maxDeadline: 2 * HOUR,
      maxSlippage: fp(0.02), // 2%
      maxBonderFeePct: fp(0.05), // 5%
      destinationChainId: 1,
      hopAmmParams: [{ token: tokens.arbitrum.WETH, amm: hop.arbitrum.ETH_AMM }],
      thresholdToken: tokens.arbitrum.USDC,
      thresholdAmount: toUSDC(500),
      gasPriceLimit: 10e9,
    },
  },
}

export type ParaswapFeeRedistributorSetupL2HopBridger = {
  namespace: string
  version: string
  from: string
  owner: string
  relayer: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  PermissionsManager: string
  l2HopBridger: {
    maxDeadline: BigNumberish
    maxSlippage: BigNumberish
    maxBonderFeePct: BigNumberish
    destinationChainId: number
    hopAmmParams: { token: string; amm: string }[]
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasPriceLimit: BigNumberish
  }
}
