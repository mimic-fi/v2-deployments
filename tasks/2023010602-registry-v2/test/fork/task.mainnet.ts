import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { RegistryDeployment } from '../../input'
import { itDeploysRegistryCorrectly } from '../behavior'

describe.skip('Registry v2 - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010602-registry-v2', getForkedNetwork(hre))
  })

  before('impersonate sender', async function () {
    const { from } = this.task.input() as RegistryDeployment
    await impersonate(from, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysRegistryCorrectly()
})
