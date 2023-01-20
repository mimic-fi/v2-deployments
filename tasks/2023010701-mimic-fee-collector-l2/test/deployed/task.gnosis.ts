import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior.gnosis'

describe('L2 Mimic fee collector v1 - gnosis', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010701-mimic-fee-collector-l2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysMimicFeeCollectorCorrectly()
})
