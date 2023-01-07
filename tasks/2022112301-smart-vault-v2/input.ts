import Task from '../../src/task'

export type SmartVaultDeployment = {
  from: string
  admin: string
  wrappedNativeToken: string
  Registry: string
}

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2022111102-registry-v1')

export default {
  from: '0x43eedc7ff3fcae6af5a8f75ff8ed75c2c9e67b68',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Registry,

  mainnet: {
    wrappedNativeToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  goerli: {
    wrappedNativeToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH
  },
}
