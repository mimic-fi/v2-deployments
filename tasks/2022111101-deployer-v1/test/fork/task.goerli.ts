import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DeployerDeployment } from '../../input'
import { itDeploysDeployerCorrectly } from '../behavior'

describe('Deployer v1 - goerli', function () {
  before('load task', function () {
    this.task = Task.forTest('2022111101-deployer-v1', getForkedNetwork(hre))
  })

  before('impersonate sender', async function () {
    const { from } = this.task.input() as DeployerDeployment
    await impersonate(from, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysDeployerCorrectly()
})
