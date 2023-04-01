import { BOT, DEPLOYER_2, OWNER_EOA } from '../../constants/mimic'
import Task from '../../src/task'

const Create3Factory = new Task('2023010600-create3-factory-v2')
const Registry = new Task('2023010602-registry-v2')
const Funder = new Task('2023010702-mimic-fee-collector-l2-no-bridge')
const Holder = new Task('2023010702-mimic-fee-collector-l2-no-bridge')
const SmartVault = new Task('2023010702-mimic-fee-collector-l2-no-bridge')

/* eslint-disable no-secrets/no-secrets */

const managers = [
  '0xFd4393f728824615ee9132D3A399C67416c0b5e1', // Personal account 1
  '0xa93680F09e9d5cb395aE4cEd72b6a0f66D5F5159', // Personal account 2
  '0xB03B9E9456752EE303c355C64Ed6EDAd20372B4c', // Personal account 3
]

export default {
  namespace: 'mimic-v2.mimic-fee-collector',
  from: DEPLOYER_2,
  owner: OWNER_EOA,
  relayer: BOT,
  managers,
  Create3Factory,
  Registry,
  SmartVault,
  Funder,
  Holder,
}

export type MimicFeeCollectorFunderV2Deployment = {
  namespace: string
  from: string
  owner: string
  relayer: string
  managers: string[]
  Registry: string
  Create3Factory: string
  SmartVault: string
  Funder: string
  Holder: string
}
