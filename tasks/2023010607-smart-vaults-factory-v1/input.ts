import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import { MimicDeployment } from '../../src/types'

export type SmartVaultsFactoryDeployment = MimicDeployment

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'SmartVaultsFactory',
  version: 'v1',
  stateless: false,
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Create3Factory,
  Registry,
}
