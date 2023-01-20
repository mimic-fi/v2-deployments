import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import goerli from './input.goerli'
import mainnet from './input.mainnet'

export type MimicFeeCollectorDeployment = {
  namespace: string
  version: string
  from: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVaultsFactory: string
  accounts: {
    bot: string
    owner: string
    managers: string[]
  }
  params: {
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      factory: string
      salt: string
      feeCollector: string
      strategies: string[]
      priceFeedParams: { base: string; quote: string; feed: string }[]
      priceOracle: string
      swapConnector: string
      bridgeConnector: string
      swapFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      bridgeFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      withdrawFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      performanceFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
    }
    funderActionParams: {
      impl: string
      admin: string
      managers: string[]
      tokenIn: string
      minBalance: BigNumberish
      maxBalance: BigNumberish
      maxSlippage: BigNumberish
      withdrawalActionParams: {
        recipient: string
      }
    }
    holderActionParams: {
      impl: string
      admin: string
      managers: string[]
      tokenOut: string
      maxSlippage: BigNumberish
      tokenThresholdActionParams: {
        amount: BigNumberish
        token: string
      }
    }
    l1HopBridgerActionParams: {
      impl: string
      admin: string
      managers: string[]
      maxDeadline: BigNumberish
      maxSlippage: BigNumberish
      hopRelayerParams: { relayer: string; maxFeePct: BigNumberish }[]
      allowedChainIds: BigNumberish[]
      hopBridgeParams: { token: string; bridge: string }[]
      tokenThresholdActionParams: {
        token: string
        amount: BigNumberish
      }
    }
  }
}

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023010601-deployer-v2')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.mimic-fee-collector',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  goerli,
  mainnet,
}
