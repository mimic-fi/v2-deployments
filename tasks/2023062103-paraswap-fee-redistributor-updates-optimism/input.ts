import { BigNumberish, fp, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/optimism'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')
const ParaswapFeeRedistributorWithdrawer = new Task('2023031300-paraswap-withdrawer')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v1',
  from: DEPLOYER_2,
  owner: '0xf93A7F819F83DBfDbC307d4D4f0FE5a208C50318',
  mimic: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  NativeClaimer: ParaswapFeeRedistributor,
  ERC20Claimer: ParaswapFeeRedistributor,
  SwapFeeSetter: ParaswapFeeRedistributor,
  Withdrawer: ParaswapFeeRedistributorWithdrawer,
  erc20Claimer: {
    tokenOut: tokens.WETH,
  },
  metamaskClaimer: {
    safe: '0x0000000000000000000000000000000000000000', // TODO: waiting for deploy
    distributor: '0x0000000000000000000000000000000000000000', // TODO: waiting for deploy
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasToken: tokens.WETH,
    gasPriceLimit: 0.5e9,
  },
  connextBridger: {
    destinationChainId: 1,
    allowedTokens: [tokens.WETH],
    maxRelayerFeePct: fp(0.05), // 5%
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasPriceLimit: 0.5e9,
  },
}

export type ParaswapFeeRedistributorUpdatesOptimism = {
  namespace: string
  version: string
  from: string
  owner: string
  mimic: string
  relayer: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  NativeClaimer: string
  ERC20Claimer: string
  SwapFeeSetter: string
  Withdrawer: string
  erc20Claimer: {
    tokenOut: string
  }
  metamaskClaimer: {
    safe: string
    distributor: string
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasToken: string
    gasPriceLimit: BigNumberish
  }
  connextBridger: {
    maxRelayerFeePct: BigNumberish
    allowedTokens: string[]
    destinationChainId: number
    thresholdToken: string
    thresholdAmount: BigNumberish
    gasPriceLimit: BigNumberish
  }
}
