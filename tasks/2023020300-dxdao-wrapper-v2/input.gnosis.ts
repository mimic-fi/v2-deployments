import { toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'

import { USD } from '../../constants/chainlink/denominations'
import * as chainlink from '../../constants/chainlink/gnosis'
import { BOT, TESTING_EOA } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/gnosis'
import Task from '../../src/task'

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2023010602-registry-v2')
const SmartVault = new Task('2023010603-smart-vault-v3')
const PriceOracle = new Task('2023010604-price-oracle-v2')
const SwapConnector = new Task('2023010605-swap-connector-v5')
const BridgeConnector = new Task('2023010606-bridge-connector-v1')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')
const MimicFeeCollector = new Task('2023010701-mimic-fee-collector-l2')

const owner = '0x000000000000000000000000000000000000dEaD' // TODO: use dx dao
const relayers = [BOT]
const managers: string[] = []
const mimicAdmin = TESTING_EOA
const feeCollector = MimicFeeCollector.key('SmartVault')

export default {
  version: 'v2',
  accounts: {
    owner,
    managers,
    relayers,
    mimicAdmin,
    feeCollector,
  },
  params: {
    registry: Registry,
    smartVaultParams: {
      impl: SmartVault,
      admin: owner,
      salt: undefined,
      factory: SmartVaultsFactory,
      feeCollector,
      feeCollectorAdmin: mimicAdmin,
      strategies: [],
      priceFeedParams: [
        { base: tokens.USDC, quote: USD, feed: chainlink.USDC_USD },
        { base: tokens.WXDAI, quote: USD, feed: chainlink.DAI_USD },
      ],
      priceOracle: PriceOracle,
      swapConnector: SwapConnector,
      bridgeConnector: BridgeConnector,
      swapFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      bridgeFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      withdrawFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
      performanceFee: { pct: 0, cap: 0, token: ZERO_ADDRESS, period: 0 },
    },
    wrapperActionParams: {
      impl: undefined,
      admin: owner,
      managers,
      withdrawalActionParams: {
        recipient: owner,
      },
      tokenThresholdActionParams: {
        token: tokens.USDC,
        amount: toUSDC(200),
      },
      relayedActionParams: {
        relayers,
        txCostLimit: 0,
        gasPriceLimit: 40e9,
      },
    },
  },
}
