import { BigNumberish } from '@mimic-fi/v2-helpers'

import { DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'
import arbitrum from './input.arbitrum'
import avalanche from './input.avalanche'
import bsc from './input.bsc'
import fantom from './input.fantom'
import mainnet from './input.mainnet'
import optimism from './input.optimism'
import polygon from './input.polygon'

const Registry = new Task('2023010602-registry-v2')
const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v1',
  from: DEPLOYER_2,
  admin: TESTING_EOA,
  Registry,
  Create3Factory,
  arbitrum,
  avalanche,
  bsc,
  fantom,
  mainnet,
  optimism,
  polygon,
}

export type ParaswapFeeRedistributorWithdrawerDeployment = {
  namespace: string
  version: string
  from: string
  admin: string
  Registry: string
  Create3Factory: string
  params: {
    owner: string
    smartVault: string
    recipient: string
    timeLock: BigNumberish
    thresholdToken: string
    thresholdAmount: BigNumberish
    relayer: string
    gasPriceLimit: BigNumberish
    txCostLimit: BigNumberish
  }
}
