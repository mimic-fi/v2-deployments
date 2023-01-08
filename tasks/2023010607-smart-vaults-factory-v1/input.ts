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
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Create3Factory,
  Registry,
}
