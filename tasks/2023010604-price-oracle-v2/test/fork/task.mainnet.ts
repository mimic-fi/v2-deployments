import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { PriceOracleDeployment } from '../../input'
import { itDeploysPriceOracleCorrectly } from '../behavior'

describe.skip('PriceOracle v2 - mainnet', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010604-price-oracle-v2', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from, admin } = this.task.input() as PriceOracleDeployment
    await impersonate(from, fp(10))
    await impersonate(admin, fp(1))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysPriceOracleCorrectly()
})
