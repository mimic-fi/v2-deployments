import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysParaswapFeeRedistributorCorrectly } from '../behavior.avalanche'

describe.skip('Paraswap fee redistributor - avalanche', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023011300-paraswap-fee-redistributor', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysParaswapFeeRedistributorCorrectly()
})
