import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

import { NETWORKS } from './types'

const RETRIES = 3
const RETRIES_INTERVAL = 15
const TASKS_DIRECTORY = path.resolve(__dirname, '../tasks')
const TASKS_IDS = fs.readdirSync(TASKS_DIRECTORY)

type TaskConfig = {
  custom: boolean
  blockNumbers: {
    [key: string]: number | undefined
  }
}

async function tests(): Promise<void> {
  const yargsParser = yargs
    .scriptName('tests')
    .option('fork', { type: 'boolean', description: 'Run fork tests' })
    .option('deployed', { type: 'boolean', description: 'Run deployed tests' })
    .option('network', { type: 'array', description: 'Optional network name(s) or all if not given', default: [] })
    .option('task', { type: 'array', description: 'Optional task ID(s) or all if not given', default: [] })

  const args = (await yargsParser.argv) as { fork?: boolean; deployed?: boolean; network: string[]; task: string[] }
  const { fork, deployed, network: networks, task: tasks } = args

  if (fork && deployed) throw Error('Pick either --fork or --deployed but not both')
  const unknownNetwork = networks.find((network) => !NETWORKS.includes(network))
  if (unknownNetwork) throw Error(`Unknown network ${unknownNetwork}`)

  if (fork) await runTests(tasks, networks, true)
  else if (deployed) await runTests(tasks, networks, false)
  else throw Error('You must tell either --fork or --deployed tests')
}

function getConfigsPerTaskId(fork: boolean) {
  return TASKS_IDS.reduce((configs: { [key: string]: TaskConfig }, taskId: string) => {
    const testDir = path.join(TASKS_DIRECTORY, taskId, 'test')
    if (!fs.existsSync(testDir) || !fs.statSync(testDir).isDirectory()) return configs

    const customDir = path.join(testDir, fork ? 'fork' : 'deployed')
    const existsCustomDir = fs.existsSync(customDir)
    configs[taskId] = { custom: existsCustomDir, blockNumbers: {} }

    const configFile = path.join(testDir, '.config.json')
    if (!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) return configs

    const config = JSON.parse(fs.readFileSync(configFile).toString())
    configs[taskId].blockNumbers = (fork ? config.fork : config.deployed) || {}
    return configs
  }, {})
}

async function runTests(taskIds: string[], networks: string[], fork: boolean) {
  const configs = getConfigsPerTaskId(fork)
  const tasksToRun = taskIds.length === 0 ? Object.keys(configs) : taskIds

  for (const taskId of tasksToRun) {
    const blockNumbersPerNetwork = configs[taskId].blockNumbers
    const networksToRun = networks.length === 0 ? Object.keys(blockNumbersPerNetwork) : networks

    for (const network of networksToRun) {
      if (blockNumbersPerNetwork[network] !== undefined) {
        const blockNumber = blockNumbersPerNetwork[network]

        process.env.TASK_ID = taskId
        process.env.TASK_TEST_TYPE = fork ? 'fork' : 'deployed'

        const isCustom = configs[taskId].custom
        const testPath = isCustom ? `./tasks/${taskId}/test/${fork ? 'fork' : 'deployed'}/*.ts` : './test/tasks/*.ts'
        const cmd = `hardhat test ${testPath} --fork ${network} ${blockNumber ? `--block-number ${blockNumber}` : ''}`
        await runTest(cmd)
      }
    }
  }
}

async function runTest(command: string, intent = 1) {
  console.log(`Running test try #${intent}`)
  const args: string[] = command.split(' ')
  const child = spawn('yarn', args, { stdio: 'inherit', shell: true })
  const exitCode = await new Promise((resolve) => child.on('close', resolve))

  if (exitCode) {
    if (intent >= RETRIES) throw new Error(`Subprocess error exit ${exitCode}`)
    console.log(`Subprocess error exit ${exitCode}, waiting ${RETRIES_INTERVAL} seconds before retrying`)
    await sleep(RETRIES_INTERVAL)
    await runTest(command, intent + 1)
  }
}

async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

tests().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
