import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'
import { DeploymentMetadata } from '../../src/types'

export type RegistryDeployment = DeploymentMetadata & {
  admin: string
}

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'Registry',
  version: 'v2',
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Create3Factory,
}
