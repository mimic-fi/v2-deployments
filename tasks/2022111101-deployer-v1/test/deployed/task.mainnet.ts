import { getForkedNetwork } from '@mimic-fi/v2-helpers'
import hre from 'hardhat'

import Task from '../../../../src/task'
import { itDeploysDeployerCorrectly } from '../behavior'

describe('Deployer v1 - mainnet', function () {
  before('load task', async function () {
    this.task = Task.forTest('2022111101-deployer-v1', getForkedNetwork(hre), getForkedNetwork(hre))
  })

  itDeploysDeployerCorrectly()
})
