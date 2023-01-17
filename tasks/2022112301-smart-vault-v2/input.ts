import { ADMIN_EOA, DEPLOYER_1 } from '../../constants/mimic'
import * as tokens from '../../constants/tokens/'
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
  from: DEPLOYER_1,
  admin: ADMIN_EOA,
  Registry,

  mainnet: {
    wrappedNativeToken: tokens.mainnet.WETH,
  },
  goerli: {
    wrappedNativeToken: tokens.goerli.WETH,
  },
}
