import { ADMIN_EOA, DEPLOYER_1 } from '../../constants/mimic'
import { goerli, mainnet } from '../../constants/tokens'
import Task from '../../src/task'

export type SmartVaultDeployment = {
  namespace: string
  from: string
  admin: string
  wrappedNativeToken: string
  Registry: string
}

/* eslint-disable no-secrets/no-secrets */

const Registry = new Task('2022111102-registry-v1')

export default {
  namespace: 'mimic-v2.@mimic-fi/v2-smart-vault/artifacts/contracts/SmartVault.sol/SmartVault',
  from: DEPLOYER_1,
  admin: ADMIN_EOA,
  Registry,

  mainnet: {
    wrappedNativeToken: mainnet.WETH,
  },
  goerli: {
    wrappedNativeToken: goerli.WETH,
  },
}
