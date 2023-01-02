import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@mimic-fi/v2-helpers/dist/tests'
import 'hardhat-local-networks-config-plugin'

import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { homedir } from 'os'
import path from 'path'

import { Logger } from './src/logger'
import Task from './src/task'
import Verifier from './src/verifier'

type DeployArgs = { id: string; force?: boolean; key?: string; verbose?: boolean }

task('deploy', 'Run deployment task')
  .addParam('id', 'Deployment task ID')
  .addFlag('force', 'Ignore previous deployments')
  .addOptionalParam('key', 'Etherscan API key to verify contracts')
  .setAction(async (args: DeployArgs, hre: HardhatRuntimeEnvironment) => {
    Logger.setDefaults(false, args.verbose || false)
    const verifier = args.key ? new Verifier(hre.network, args.key) : undefined
    await Task.fromHRE(args.id, hre, verifier).run(args)
  })

export default {
  localNetworksConfig: path.join(homedir(), '/.hardhat/networks.mimic.json'),
  mocha: {
    timeout: 800000,
  },
}
