import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDxDaoBridgerCorrectly } from '../behavior.goerli'

describe('L1 DXdao bridger v1 - goerli', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010703-dxdao-bridger-l1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDxDaoBridgerCorrectly()
})
