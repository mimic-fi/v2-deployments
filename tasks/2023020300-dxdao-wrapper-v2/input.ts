import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import gnosis from './input.gnosis'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023020100-deployer-v3')
const Registry = new Task('2023010602-registry-v2')
const SmartVaultsFactory = new Task('2023010607-smart-vaults-factory-v1')

export default {
  namespace: 'mimic-v2.dxdao-wrapper',
  version: 'v1',
  from: DEPLOYER_2,
  Create3Factory,
  Deployer,
  Registry,
  SmartVaultsFactory,
  gnosis,
}

export type DxDaoWrapperDeployment = {
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
    mimicAdmin: string
    feeCollector: string
  }
  params: {
    registry: string
    smartVaultParams: {
      salt: string
      factory: string
      impl: string
      admin: string
      feeCollector: string
      feeCollectorAdmin: string
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
    wrapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      withdrawalActionParams: {
        recipient: string
      }
      tokenThresholdActionParams: {
        amount: BigNumberish
        token: string
      }
      relayedActionParams: {
        relayers: string[]
        txCostLimit: BigNumberish
        gasPriceLimit: BigNumberish
      }
    }
  }
}
