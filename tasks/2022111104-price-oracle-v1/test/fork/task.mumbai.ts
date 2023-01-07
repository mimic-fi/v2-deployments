import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { PriceOracleDeployment } from '../../input'
import { itDeploysPriceOracleCorrectly } from '../behavior'

describe('PriceOracle v1 - mumbai', function () {
  before('load task', function () {
    this.task = Task.forTest('2022111104-price-oracle-v1', getForkedNetwork(hre))
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
