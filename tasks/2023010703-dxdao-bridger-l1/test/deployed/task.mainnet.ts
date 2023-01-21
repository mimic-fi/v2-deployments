import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDxDaoBridgerCorrectly } from '../behavior.mainnet'

describe.skip('L1 DXdao bridger v1 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010703-dxdao-bridger-l1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDxDaoBridgerCorrectly()
})
