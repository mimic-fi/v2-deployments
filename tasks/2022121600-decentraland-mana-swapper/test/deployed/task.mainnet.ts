import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDecentralandManaSwapperCorrectly } from '../behavior'

describe('Decentraland MANA Swapper - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022121600-decentraland-mana-swapper', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDecentralandManaSwapperCorrectly()
})
