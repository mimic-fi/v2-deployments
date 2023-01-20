import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysMimicFeeCollectorCorrectly } from '../behavior.bsc'

describe('L2 Mimic fee collector v1 - bsc', function () {
  before('load task', async function () {
    this.task = Task.forTest(
      '2023010702-mimic-fee-collector-l2-no-bridge',
      getForkedNetwork(hre),
      getForkedNetwork(hre)
    )
  })

  itDeploysMimicFeeCollectorCorrectly()
})
