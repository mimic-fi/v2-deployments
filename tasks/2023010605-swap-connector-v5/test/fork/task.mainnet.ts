import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { SwapConnectorDeployment } from '../../input'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe.skip('SwapConnector v5 - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010605-swap-connector-v5', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as SwapConnectorDeployment
    await impersonate(from, fp(10))
    await impersonate(admin, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysSwapConnectorCorrectly()
})