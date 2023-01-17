import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_1 } from '../../constants/mimic'
import Task from '../../src/task'
import goerli from './input.goerli'
import mainnet from './input.mainnet'

const Create3Factory = new Task('2022111100-create3-factory-v1')
const Deployer = new Task('2022111101-deployer-v1')
const Registry = new Task('2022111102-registry-v1')

export type DxDaoWrapperDeployment = {
  from: string
  namespace: string
  Create3Factory: string
  Deployer: string
  Registry: string
  accounts: {
    owner: string
    relayers: string[]
    managers: string[]
    feeCollector: string
  }
  params: {
    registry: string
    smartVaultParams: {
      impl: string
      admin: string
      feeCollector: string
      strategies: string[]
      priceFeedParams: { base: string; quote: string; feed: string }[]
      priceOracle: string
      swapConnector: string
      swapFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      withdrawFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
      performanceFee: { pct: BigNumberish; cap: BigNumberish; token: string; period: BigNumberish }
    }
    wrapperActionParams: {
      impl: string
      admin: string
      managers: string[]
      relayedActionParams: {
        relayers: string[]
        gasPriceLimit: BigNumberish
        totalCostLimit: BigNumberish
        payingGasToken: string
      }
      tokenThresholdActionParams: {
        amount: BigNumberish
        token: string
      }
      withdrawalActionParams: {
        recipient: string
      }
    }
  }
}

/* eslint-disable no-secrets/no-secrets */

export default {
  from: DEPLOYER_1,
  namespace: 'mimic-v2.dxdao-sv1',
  Create3Factory,
  Deployer,
  Registry,
  goerli,
  mainnet,
}
