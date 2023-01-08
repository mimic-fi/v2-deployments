import { BigNumberish } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'
import goerli from './input.goerli'

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
      maxSlippage: BigNumberish
      tokenOut: string
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
        amount: BigNumberish
        token: string
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
  version: 'v3',
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  goerli,
}
