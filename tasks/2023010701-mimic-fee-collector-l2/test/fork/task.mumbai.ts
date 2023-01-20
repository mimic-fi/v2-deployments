import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { MimicFeeCollectorDeployment } from '../../input'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior.mumbai'

describe('L2 Mimic fee collector v1 - mumbai', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010701-mimic-fee-collector-l2', getForkedNetwork(hre))
    this.l1Task = Task.forTest('2023010700-mimic-fee-collector-l1', 'goerli')
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as MimicFeeCollectorDeployment
    await impersonate(from, fp(50))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysMimicFeeCollectorCorrectly()
})
