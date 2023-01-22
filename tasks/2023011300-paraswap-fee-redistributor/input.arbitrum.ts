import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { BOT, OWNER_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/arbitrum'
import Task from '../../src/task'

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010701-mimic-fee-collector-l2')

/* eslint-disable no-secrets/no-secrets */

const owner = '0x7dA82E75BE36Ab9625B1dd40A5aE5181b43473f3' // Paraswap multisig
const feeClaimer = '0xA7465CCD97899edcf11C56D2d26B49125674e45F'
const swapSigner = '0x213ec49E59E6D219Db083C2833746b5dFCad646c'
const managers: string[] = []
const relayers = [BOT]

export default {
  accounts: {
    owner,
    managers,
    relayers,
    mimicAdmin: OWNER_EOA,
    feeCollector: MimicFeeCollector.key('SmartVault'),
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      salt: undefined,
      factory: SmartVaultsFactory,
      impl: SmartVault,
      admin: owner,
      feeCollector: MimicFeeCollector.key('SmartVault'),
      strategies: [],
      priceFeedParams: [], // TODO
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    erc20ClaimerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      maxSlippage: 0, // TODO
      swapSigner,
      tokenSwapIgnores: [], // TODO
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: '', // TODO
          amount: 0, // TODO
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 100e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
          permissiveModeAdmin: OWNER_EOA,
          isPermissiveModeActive: false,
        },
      },
    },
    nativeClaimerActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      feeClaimerParams: {
        feeClaimer,
        tokenThresholdActionParams: {
          token: '', // TODO
          amount: 0, // TODO
        },
        relayedActionParams: {
          relayers,
          gasPriceLimit: 100e9,
          totalCostLimit: 0,
          payingGasToken: tokens.WETH,
          permissiveModeAdmin: OWNER_EOA,
          isPermissiveModeActive: false,
        },
      },
    },
    swapFeeSetterActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      feeParams: [], // TODO
      timeLockedActionParams: {
        period: 0, // TODO
      },
      relayedActionParams: {
        relayers,
        gasPriceLimit: 100e9,
        totalCostLimit: 0,
        payingGasToken: tokens.WETH,
        permissiveModeAdmin: OWNER_EOA,
        isPermissiveModeActive: false,
      },
    },
  },
}
