import { BOT, DEPLOYER_2, TESTING_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const ParaswapFeeRedistributor = new Task('2023020101-paraswap-fee-redistributor')
const MetamaskClaimer = new Task('2023070601-paraswap-fee-redistributor-update-metamask-claimer')

/* eslint-disable no-secrets/no-secrets */

export default {
  namespace: 'mimic-v2.paraswap-fee-redistributor',
  version: 'v4',
  from: DEPLOYER_2,
  mimic: TESTING_EOA,
  relayer: BOT,
  Create3Factory,
  Registry,
  SmartVault: ParaswapFeeRedistributor,
  MetamaskClaimer,
  mainnet: {
    owner: '0x619bbf92fd6ba59893327676b2685a3762a49a33',
    PermissionsManager: new Task('2023062100-paraswap-fee-redistributor-updates-mainnet'),
  },
  polygon: {
    owner: '0xabf832105d7d19e5dec28d014d5a12579dfa1097',
    PermissionsManager: new Task('2023062101-paraswap-fee-redistributor-updates-polygon'),
  },
  arbitrum: {
    owner: '0x7dA82E75BE36Ab9625B1dd40A5aE5181b43473f3',
    PermissionsManager: new Task('2023062102-paraswap-fee-redistributor-updates-arbitrum'),
  },
  optimism: {
    owner: '0xf93A7F819F83DBfDbC307d4D4f0FE5a208C50318',
    PermissionsManager: new Task('2023062103-paraswap-fee-redistributor-updates-optimism'),
  },
  bsc: {
    owner: '0x8c1a1d0b6286f35d47a676ab78482f1cf3d749dc',
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
