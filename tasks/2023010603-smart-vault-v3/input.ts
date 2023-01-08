import Task from '../../src/task'
import { MimicDeployment } from '../../src/types'

export type SmartVaultDeployment = MimicDeployment & {
  wrappedNativeToken: string
}

/* eslint-disable no-secrets/no-secrets */

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')

export default {
  namespace: 'mimic-v2',
  contractName: 'SmartVault',
  version: 'v3',
  stateless: false,
  from: '0x55fb751f3022D56888fb3249002C1004579753C7',
  admin: '0x82109Cc00922A515D5FA14eE05a6880c6FAB5E19',
  Registry,
  Create3Factory,

  mainnet: {
    wrappedNativeToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  goerli: {
    wrappedNativeToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH
  },
  mumbai: {
    wrappedNativeToken: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // WMATIC
  },
}
