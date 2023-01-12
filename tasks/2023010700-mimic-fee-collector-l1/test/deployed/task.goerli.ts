import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior.goerli'

describe.skip('L1 Mimic fee collector v1 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010700-mimic-fee-collector-l1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysMimicFeeCollectorCorrectly()
})
