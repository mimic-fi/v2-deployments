import { ADMIN_EOA, DEPLOYER_2 } from '../../constants/mimic'
import Task from '../../src/task'

export type RegistryDeployment = {
  namespace: string
  version: string
  from: string
  admin: string
  Create3Factory: string
}

const Create3Factory = new Task('2023010600-create3-factory-v2')

export default {
  namespace: 'mimic-v2',
  version: 'v2',
  from: DEPLOYER_2,
  admin: ADMIN_EOA,
  Create3Factory,
}
