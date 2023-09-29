import { fp } from '@mimic-fi/v2-helpers'

import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Registry = new Task('2023010602-registry-v2')
const Create3Factory = new Task('2023010600-create3-factory-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v2',
  from: DEPLOYER_2,
  mimic: TESTING_EOA,
  relayer: BOT,
  Registry,
  Create3Factory,
  SmartVault: ParaswapFeeRedistributor,
  polygon: {
    maxSlippage: fp(0.02), // 2%
    owner: '0xabf832105d7d19e5dec28d014d5a12579dfa1097',
    ConnextBridger: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
    PermissionsManager: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
  },
  arbitrum: {
    maxSlippage: fp(0.02), // 2%
    owner: '0x7dA82E75BE36Ab9625B1dd40A5aE5181b43473f3',
    ConnextBridger: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
    PermissionsManager: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
  },
  optimism: {
    maxSlippage: fp(0.02), // 2%
    owner: '0xf93A7F819F83DBfDbC307d4D4f0FE5a208C50318',
    ConnextBridger: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
    PermissionsManager: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
  },
  bsc: {
    maxSlippage: fp(0.02), // 2%
    owner: '0x8c1a1d0b6286f35d47a676ab78482f1cf3d749dc',
    ConnextBridger: new Task('2023062104-paraswap-fee-redistributor-updates-bsc'),
    PermissionsManager: new Task('2023062104-paraswap-fee-redistributor-updates-bsc'),
  },
}

export type ParaswapFeeRedistributorConnextBridgerUpdate = {
  namespace: string
  version: string
  from: string
  owner: string
  mimic: string
  relayer: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  ConnextBridger: string
  PermissionsManager: string
  maxSlippage: string
}
