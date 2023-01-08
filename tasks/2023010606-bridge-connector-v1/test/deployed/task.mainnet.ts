import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysBridgeConnectorCorrectly } from '../behavior'

describe.skip('BridgeConnector v1 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010606-bridge-connector-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysBridgeConnectorCorrectly()
})
