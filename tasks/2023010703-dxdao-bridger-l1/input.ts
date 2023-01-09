import { BigNumberish } from '@mimic-fi/v2-helpers'

import Task from '../../src/task'
import goerli from './input.goerli'

export type DxDaoBridgerDeployment = {
  namespace: string
  version: string
  from: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVaultsFactory: string
  accounts: {
    owner: string
    managers: string[]
    relayers: string[]
    feeCollector: string
  }
  params: {
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      salt: string
      factory: string
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
    l1HopBridgerActionParams: {
      impl: string
      admin: string
      managers: string[]
      maxDeadline: BigNumberish
      maxSlippage: BigNumberish
      hopRelayerParams: { relayer: string; maxFeePct: BigNumberish }[]
      destinationChainId: BigNumberish
      hopBridgeParams: { token: string; bridge: string }[]
      tokenThresholdActionParams: {
        token: BigNumberish
        amount: string
      }
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
        permissiveModeAdmin: string
        setPermissiveMode: boolean
      }
    }
  }
}

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023010601-deployer-v2')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.dxdao-bridger',
  version: 'v1',
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  goerli,
}
