import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysPriceOracleCorrectly } from '../behavior'

describe('PriceOracle v1 - mumbai', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111104-price-oracle-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysPriceOracleCorrectly()
})
