import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

import { NETWORKS } from './types'

const ALL = 'all'
const TASKS_DIRECTORY = path.resolve(__dirname, '../tasks')
const TASKS_IDS = fs.readdirSync(TASKS_DIRECTORY)

type BlockNumbersPerNetwork = { [key: string]: number | undefined }

async function tests(): Promise<void> {
  const yargsParser = yargs
    .scriptName('tests')
    .option('fork', { type: 'boolean', description: 'Run fork tests' })
    .option('deployed', { type: 'boolean', description: 'Run deployed tests' })
    .option('network', { type: 'string', description: 'Optional network name or all if not given' })
    .option('task', { type: 'string', description: 'Optional task ID or all if not given', default: ALL })

  const { fork, deployed, network, task } = await yargsParser.argv

  if (fork && deployed) throw Error('Pick either --fork or --deployed but not both')
  if (network && !NETWORKS.includes(network)) throw Error(`Unknown network ${network}`)

  if (fork) await runTests(task, true, network)
  else if (deployed) await runTests(task, false, network)
  else throw Error('You must tell either --fork or --deployed tests')
}

function getConfigsPerTaskId(fork: boolean) {
  return TASKS_IDS.reduce((configs: { [key: string]: BlockNumbersPerNetwork }, taskId: string) => {
    const testDir = path.join(TASKS_DIRECTORY, taskId, 'test')
    if (!fs.existsSync(testDir) || !fs.statSync(testDir).isDirectory()) return configs

    const configFile = path.join(testDir, '.config.json')
    if (!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) return configs

    const config = JSON.parse(fs.readFileSync(configFile).toString())
    configs[taskId] = (fork ? config.fork : config.deployed) || {}
    return configs
  }, {})
}

async function runTests(runTaskId: string, fork: boolean, network?: string) {
  const configs = getConfigsPerTaskId(fork)
  for (const taskId of Object.keys(configs)) {
    if (runTaskId === ALL || runTaskId === taskId) {
      const tests = `./tasks/${taskId}/test/${fork ? 'fork' : 'deployed'}/${network ? `*.${network}.ts` : '*.ts'}`

      if (network) {
        const blockNumber = configs[taskId][network]
        if (blockNumber !== undefined) {
          await runTest(`hardhat test ${tests} --fork ${network} ${blockNumber ? `--block-number ${blockNumber}` : ''}`)
        }
      } else {
        for (const network of Object.keys(configs[taskId])) {
          const blockNumber = configs[taskId][network]
          await runTest(`hardhat test ${tests} --fork ${network} ${blockNumber ? `--block-number ${blockNumber}` : ''}`)
        }
      }
    }
  }
}

async function runTest(command: string) {
  const args: string[] = command.split(' ')

  async function spawnChild() {
    const child = spawn('yarn', args, { stdio: 'inherit', shell: true })
    if (child.stdout) for await (const chunk of child.stdout) console.log('' + chunk)
    if (child.stderr) for await (const chunk of child.stderr) console.error('' + chunk)
    const exitCode = await new Promise((resolve) => child.on('close', resolve))
    if (exitCode) throw new Error(`subprocess error exit ${exitCode}`)
  }

  await spawnChild()
}

tests().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
