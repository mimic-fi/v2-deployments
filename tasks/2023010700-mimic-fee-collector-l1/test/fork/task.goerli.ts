import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { MimicFeeCollectorDeployment } from '../../input'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior'

describe('L1 Mimic fee collector v1 - goerli', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010700-mimic-fee-collector-l1', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as MimicFeeCollectorDeployment
    await impersonate(from, fp(5))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysMimicFeeCollectorCorrectly()
})
