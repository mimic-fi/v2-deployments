import { BigNumberish, toUSDC } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/mainnet'
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
  owner: '0x619bbf92fd6ba59893327676b2685a3762a49a33',
  mimic: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  NativeClaimer: ParaswapFeeRedistributor,
  ERC20Claimer: ParaswapFeeRedistributor,
  Withdrawer: ParaswapFeeRedistributorWithdrawer,
  erc20Claimer: {
    tokenOut: tokens.WETH,
  },
  metamaskClaimer: {
    safe: '0xb1720612D0131839DC489fCf20398Ea925282fCa',
    distributor: '0xdc838074D95C89a5C2CbF26984FEDc9160b61620',
    thresholdToken: tokens.USDC,
    thresholdAmount: toUSDC(500),
    gasToken: tokens.WETH,
    gasPriceLimit: 30e9,
  },
}

export type ParaswapFeeRedistributorUpdatesMainnet = {
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
}
