import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023032100-deployer-v4')
const Registry = new Task('2023010602-registry-v2')

const BalancerFeeCollectorL1Task = new Task('2023032101-balancer-fee-collector-l1')
const BalancerFeeCollectorL2Task = new Task('2023032102-balancer-fee-collector-l2')

const BalancerFeeCollectorL1UpdateTask = new Task('2023042600-balancer-fee-collector-l1-updates')
const BalancerFeeCollectorL2UpdateTask = new Task('2023042601-balancer-fee-collector-l2-updates')

const BalancerFeeCollectorL2V2Task = new Task('2023050301-balancer-fee-collector-l2-v2')

export default {
  namespace: 'mimic-v2.balancer-fee-collector',
  version: 'v3',
  from: DEPLOYER_2,
  relayer: BOT,
  Create3Factory,
  Deployer,
  Registry,
  BalancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  owner: TESTING_EOA,

  mainnet: {
    SmartVault: BalancerFeeCollectorL1Task,
    BPTSwapper: BalancerFeeCollectorL1UpdateTask,
    PermissionsManager: BalancerFeeCollectorL1Task,
  },
  optimism: {
    SmartVault: BalancerFeeCollectorL2Task,
    BPTSwapper: BalancerFeeCollectorL2UpdateTask,
    PermissionsManager: BalancerFeeCollectorL2Task,
  },
  arbitrum: {
    BPTSwapper: BalancerFeeCollectorL2V2Task,
    SmartVault: BalancerFeeCollectorL2V2Task,
    PermissionsManager: BalancerFeeCollectorL2V2Task,
  },
  polygon: {
    BPTSwapper: BalancerFeeCollectorL2V2Task,
    SmartVault: BalancerFeeCollectorL2V2Task,
    PermissionsManager: BalancerFeeCollectorL2V2Task,
  },
  gnosis: {
    BPTSwapper: BalancerFeeCollectorL2V2Task,
    SmartVault: BalancerFeeCollectorL2V2Task,
    PermissionsManager: BalancerFeeCollectorL2V2Task,
  },
}

export type BalancerFeeCollectorBptSwapperUpdate = {
  namespace: string
  version: string
  from: string
  relayer: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVault: string
  BPTSwapper: string
  PermissionsManager: string
  BalancerVault: string
  owner: string
}
