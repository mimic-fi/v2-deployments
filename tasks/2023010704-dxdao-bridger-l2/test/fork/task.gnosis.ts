import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { DxDaoBridgerDeployment } from '../../input'
import { itDeploysDxDaoBridgerCorrectly } from '../behavior.gnosis'

describe('L2 DXdao bridger v1 - gnosis', function () {
  before('load task', function () {
    this.task = Task.forTest('2023010704-dxdao-bridger-l2', getForkedNetwork(hre))
  })

  before('impersonate sender and admin', async function () {
    const { from } = this.task.input() as DxDaoBridgerDeployment
    await impersonate(from, fp(10))
  })

  before('deploy task', async function () {
    await this.task.run({ force: true })
  })

  itDeploysDxDaoBridgerCorrectly()
})
