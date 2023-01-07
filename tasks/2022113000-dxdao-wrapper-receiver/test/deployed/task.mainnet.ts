import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysSwapConnectorCorrectly } from '../behavior'

describe('DXDao Wrapper Receiver - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022113000-dxdao-wrapper-receiver', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysSwapConnectorCorrectly()
})
