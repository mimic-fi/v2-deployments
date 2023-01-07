import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DecentralandManaSwapperDeployment } from '../../input'
import { itDeploysDecentralandManaSwapperCorrectly } from '../behavior'

describe('Decentraland MANA Swapper - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2022121600-decentraland-mana-swapper', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as DecentralandManaSwapperDeployment
    await impersonate(from, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysDecentralandManaSwapperCorrectly()
})
