import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysParaswapFeeRedistributorCorrectly } from '../behavior.mainnet'

describe('Paraswap Fee redistributor - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest(
      '2022111502-paraswap-fee-redistributor-mimic',
      getForkedNetwork(hre),
      getForkedNetwork(hre)
    )
  })

  itDeploysParaswapFeeRedistributorCorrectly()
})
