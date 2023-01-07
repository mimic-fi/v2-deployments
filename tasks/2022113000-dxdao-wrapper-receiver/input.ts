import Task from '../../src/task'

export type DXDaoWrapperReceiverDeployment = {
  namespace: string
  from: string
  Create3Factory: string
  SmartVault: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2022111100-create3-factory-v1')
const DXDaoWrapper = new Task('2022111400-dxdao-wrapper')

export default {
  namespace: 'mimic-v2.dxdao-sv1',
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  Create3Factory,
  SmartVault: DXDaoWrapper,
}
