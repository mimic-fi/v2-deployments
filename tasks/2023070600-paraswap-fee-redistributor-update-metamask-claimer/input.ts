import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v2',
  from: DEPLOYER_2,
  mimic: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  mainnet: {
    owner: '0xAFFdeC0FE0B5BBfd725642D87D14c465d25F8dE8',
    MetamaskClaimer: new Task('2023062100-paraswap-fee-redistributor-updates-mainnet'),
    PermissionsManager: new Task('2023062100-paraswap-fee-redistributor-updates-mainnet'),
  },
  polygon: {
    owner: '0xabf832105d7d19e5dec28d014d5a12579dfa1097',
    MetamaskClaimer: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
    PermissionsManager: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
  },
  arbitrum: {
    owner: '0x7dA82E75BE36Ab9625B1dd40A5aE5181b43473f3',
    MetamaskClaimer: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
    PermissionsManager: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
  },
  optimism: {
    owner: '0xf93A7F819F83DBfDbC307d4D4f0FE5a208C50318',
    MetamaskClaimer: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
    PermissionsManager: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
  },
  bsc: {
    owner: '0x8c1a1d0b6286f35d47a676ab78482f1cf3d749dc',
    MetamaskClaimer: new Task('2023062104-paraswap-fee-redistributor-updates-bsc'),
    PermissionsManager: new Task('2023062104-paraswap-fee-redistributor-updates-bsc'),
  },
}

export type ParaswapFeeRedistributorMetamaskClaimerUpdate = {
  namespace: string
  version: string
  from: string
  owner: string
  mimic: string
  relayer: string
  Registry: string
  Create3Factory: string
  SmartVault: string
  MetamaskClaimer: string
  PermissionsManager: string
}
