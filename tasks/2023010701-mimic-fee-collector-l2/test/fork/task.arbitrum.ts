import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { MimicFeeCollectorDeployment } from '../../input'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior.arbitrum'

describe('L2 Mimic fee collector v1 - arbitrum', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010701-mimic-fee-collector-l2', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as MimicFeeCollectorDeployment
    await impersonate(from, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysMimicFeeCollectorCorrectly()
})
