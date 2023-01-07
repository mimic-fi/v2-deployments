import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe('SwapConnector v3 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111501-swap-connector-v3', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSwapConnectorCorrectly()
})
