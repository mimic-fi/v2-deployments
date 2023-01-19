import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysPriceOracleCorrectly } from '../behavior'

describe('PriceOracle v2 - gnosis', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010604-price-oracle-v2', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysPriceOracleCorrectly()
})
