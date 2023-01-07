import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe('SwapConnector v1 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111105-swap-connector-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSwapConnectorCorrectly()
})
