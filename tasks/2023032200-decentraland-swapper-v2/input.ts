import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import mainnet from './input.mainnet'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2022111101-deployer-v1')
const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.decentraland-mana-swapper',
  from: DEPLOYER_2,
  version: 'v1',
  Create3Factory,
  Deployer,
  Registry,
  mainnet,
}

export type DecentralandSwapperV2Deployment = {
  namespace: string
  from: string
  version: string
  Registry: string
  Deployer: string
  Create3Factory: string
  params: {
    smartVault: string
    tokenIn: string
    tokenOut: string
    maxSlippage: BigNumberish
    swapLimitToken: string
    swapLimitAmount: BigNumberish
    swapLimitPeriod: BigNumberish
    thresholdToken: string
    thresholdAmount: BigNumberish
    relayer: string
    gasPriceLimit: BigNumberish
    totalCostLimit: BigNumberish
    payingGasToken: string
    admin: string
  }
}
