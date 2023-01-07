import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { Create3FactoryDeployment } from '../../input'
import { itBehavesLikeCreate3Factory } from '../behavior'

describe('Create3Factory v1 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111100-create3-factory-v1', getForkedNetwork(hre))
  })

  before('impersonate sender', async function () {
    const { from } = this.task.input() as Create3FactoryDeployment
    await impersonate(from, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itBehavesLikeCreate3Factory()
})
