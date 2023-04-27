import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Deployer = new Task('2023032100-deployer-v4')
const Registry = new Task('2023010602-registry-v2')
const BalancerFeeCollectorTask = new Task('2023032101-balancer-fee-collector-l1')

export default {
  namespace: 'mimic-v2.balancer-fee-collector',
  version: 'v2',
  from: DEPLOYER_2,
  relayer: BOT,
  Create3Factory,
  Deployer,
  Registry,
  SmartVault: BalancerFeeCollectorTask,
  Claimer: BalancerFeeCollectorTask,
  PermissionsManager: BalancerFeeCollectorTask,
  BalancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  owner: TESTING_EOA,
}

export type BalancerFeeCollectorL1Updates = {
  namespace: string
  version: string
  from: string
  relayer: string
  Registry: string
  Deployer: string
  Create3Factory: string
  SmartVault: string
  Claimer: string
  PermissionsManager: string
  BalancerVault: string
  owner: string
}
