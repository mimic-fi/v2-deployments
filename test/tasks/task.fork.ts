import { fp, getForkedNetwork, impersonate } from '@mimic-fi/v2-helpers'
import fs from 'fs'
import hre from 'hardhat'
import path from 'path'

import Task from '../../src/task'

const { TASK_ID, TASK_TEST_TYPE } = process.env
if (!TASK_ID) throw Error('TASK_ID variable not set')

const network = getForkedNetwork(hre)
const genericBehaviorPath = path.resolve(__dirname, `../../tasks/${TASK_ID}/test/behavior.ts`)
const networkBehaviorPath = path.resolve(__dirname, `../../tasks/${TASK_ID}/test/behavior.${network}.ts`)
const missingTaskBehavior = !fs.existsSync(genericBehaviorPath) && !fs.existsSync(networkBehaviorPath)
if (missingTaskBehavior) throw Error(`Could not find a behavior for task ${TASK_ID}`)

/* eslint-disable @typescript-eslint/no-var-requires */

describe(`${TASK_ID} - ${network} [${TASK_TEST_TYPE}]`, function () {
  const isForkTest = TASK_TEST_TYPE == 'fork'

  before('load task', async function () {
    this.task = Task.forTest(TASK_ID, network, isForkTest ? 'test' : network)
  })

  if (isForkTest) {
    before('deploy task', async function () {
      const input = this.task.input()
      if (input.from) await impersonate(input.from, fp(100))
      if (input.admin) await impersonate(input.admin, fp(100))
      if (input.owner) await impersonate(input.owner, fp(100))
      await this.task.run({ force: true })
    })
  }

  const behavior = require(fs.existsSync(networkBehaviorPath) ? networkBehaviorPath : genericBehaviorPath).default
  behavior()
})
