import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDxDaoBridgerCorrectly } from '../behavior'

describe('L2 DXdao bridger v1 - mumbai', function () {
  before('load task', async function () {
    this.task = Task.forTest('2023010704-dxdao-bridger-l2', getForkedNetwork(hre), getForkedNetwork(hre))
    this.l1Task = Task.forTest('2023010703-dxdao-bridger-l1', 'goerli', 'goerli')
  })

  itDeploysDxDaoBridgerCorrectly()
})
