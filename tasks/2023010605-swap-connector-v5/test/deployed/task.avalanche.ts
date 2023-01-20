import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe('SwapConnector v5 - avalanche', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010605-swap-connector-v5', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSwapConnectorCorrectly()
})
