import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { BridgeConnectorDeployment } from '../../input'
import { itDeploysBridgeConnectorCorrectly } from '../behavior'

describe('BridgeConnector v1 - gnosis', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010606-bridge-connector-v1', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as BridgeConnectorDeployment
    await impersonate(from, fp(100))
    await impersonate(admin, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysBridgeConnectorCorrectly()
})