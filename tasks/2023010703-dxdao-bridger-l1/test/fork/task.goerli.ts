import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DxDaoBridgerDeployment } from '../../input'
import { itDeploysDxDaoBridgerCorrectly } from '../behavior'

describe('L1 DXdao bridger v1 - goerli', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010703-dxdao-bridger-l1', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as DxDaoBridgerDeployment
    await impersonate(from, fp(5))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysDxDaoBridgerCorrectly()
})
