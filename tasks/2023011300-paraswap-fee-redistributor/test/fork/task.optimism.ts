import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { ParaswapFeeRedistributorDeployment } from '../../input'
import { itDeploysParaswapFeeRedistributorCorrectly } from '../behavior.optimism'

describe('Paraswap fee redistributor - optimism', function () {
  before('load task', function () {
    this.task = Task.forTest('2023011300-paraswap-fee-redistributor', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as ParaswapFeeRedistributorDeployment
    await impersonate(from, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysParaswapFeeRedistributorCorrectly()
})
