import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysParaswapFeeRedistributorCorrectly } from '../behavior.optimism'

describe.skip('Paraswap fee redistributor - optimism', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023011300-paraswap-fee-redistributor', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysParaswapFeeRedistributorCorrectly()
})
