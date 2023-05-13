import { ArtifactLike, deploy, getCreationCode, instanceAt, Libraries } from '@mimic-fi/v2-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, Contract } from 'ethers'
import fs from 'fs'
import { BuildInfo, CompilerOutputContract, HardhatRuntimeEnvironment } from 'hardhat/types'
import path, { extname } from 'path'

import logger from './logger'
import {
  Artifact,
  Input,
  Network,
  NETWORKS,
  Output,
  Param,
  RawInputKeyValue,
  RawOutput,
  TaskOutput,
  TaskRunOptions,
} from './types'
import Verifier from './verifier'

const TASKS_DIRECTORY = path.resolve(__dirname, '../tasks')

export default class Task {
  id: string
  _network?: Network
  _verifier?: Verifier
  _outputFile?: string

  static fromHRE(id: string, hre: HardhatRuntimeEnvironment, verifier?: Verifier): Task {
    return new this(id, hre.network.name, verifier)
  }

  static forTest(id: string, network: Network, outputTestFile = 'test'): Task {
    const task = new this(id, network)
    task.outputFile = outputTestFile
    return task
  }

  constructor(id: string, network?: Network, verifier?: Verifier) {
    if (network && !NETWORKS.includes(network)) throw Error(`Unknown network ${network}`)
    this.id = id
    this._network = network
    this._verifier = verifier
  }

  get isTest(): boolean {
    return this._outputFile === 'test'
  }

  get outputFile(): string {
    return `${this._outputFile || this.network}.json`
  }

  set outputFile(file: string) {
    this._outputFile = file
  }

  get network(): Network {
    if (!this._network) throw Error('A network must be specified to define a task')
    return this._network
  }

  set network(name: Network) {
    this._network = name
  }

  key(key: string): TaskOutput {
    return { task: this, key }
  }

  async getCreationCode(name: string, args: Array<Param> = [], libs?: Libraries): Promise<string> {
    const artifactLike = this.artifactLike(name)
    return getCreationCode(artifactLike, args, libs)
  }

  async instanceAt(name: string, address: string): Promise<Contract> {
    const artifactLike = this.artifactLike(name)
    return instanceAt(artifactLike, address)
  }

  async deployedInstance(name: string, contractName = name): Promise<Contract> {
    const address = this.output()[name]
    if (!address) throw Error(`Could not find deployed address for ${name}`)
    return this.instanceAt(contractName, address)
  }

  async inputDeployedInstance(name: string): Promise<Contract> {
    const inputTask = this.rawInput()[name]
    inputTask.network = this.network
    return inputTask.deployedInstance(name)
  }

  async deploy(name: string, args: Array<Param> = [], from?: SignerWithAddress, libs?: Libraries): Promise<Contract> {
    const artifactLike = this.artifactLike(name)
    const instance = await deploy(artifactLike, args, from, libs)
    logger.success(`Deployed ${name} at ${instance.address}`)
    return from ? instance.connect(from) : instance
  }

  async verify(name: string, address: string, constructorArguments: unknown, libs?: Libraries): Promise<void> {
    try {
      if (!this._verifier) return logger.warn('Skipping contract verification, no verifier defined')
      const url = await this._verifier.call(this, name, address, constructorArguments, libs)
      logger.success(`Verified contract ${name} at ${url}`)
    } catch (error) {
      logger.error(`Failed trying to verify ${name} at ${address}: ${error}`)
    }
  }

  async deployAndVerify(
    name: string,
    args: Array<Param> = [],
    from?: SignerWithAddress,
    force?: boolean,
    key = name,
    libs?: Libraries
  ): Promise<Contract> {
    const output = this.output({ ensure: false })
    if (force || !output[key]) {
      const instance = await this.deploy(name, args, from, libs)
      this.save({ [key]: instance })
      await this.verify(name, instance.address, args, libs)
      return instance
    } else {
      logger.info(`${name} already deployed at ${output[key]}`)
      await this.verify(name, output[key], args, libs)
      const instance = await this.instanceAt(name, output[key])
      return from ? instance.connect(from) : instance
    }
  }

  async run(options: TaskRunOptions = {}): Promise<void> {
    const taskPath = this._fileAt(this.dir(), 'index.ts')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const task = require(taskPath).default
    await task(this, options)
  }

  dir(): string {
    if (!this.id) throw Error('Please provide a task deployment ID to run')
    return this._dirAt(TASKS_DIRECTORY, this.id)
  }

  buildInfo(fileName: string): BuildInfo {
    const buildInfoDir = this._dirAt(this.dir(), 'build-info')
    const artifactFile = this._fileAt(buildInfoDir, `${extname(fileName) ? fileName : `${fileName}.json`}`)
    return JSON.parse(fs.readFileSync(artifactFile).toString())
  }

  buildInfos(): Array<BuildInfo> {
    const buildInfoDir = this._dirAt(this.dir(), 'build-info')
    return fs.readdirSync(buildInfoDir).map((fileName) => this.buildInfo(fileName))
  }

  artifactLike(name: string): ArtifactLike {
    const artifact = this.artifact(name)
    const { object, linkReferences } = artifact.evm.bytecode
    return { abi: artifact.abi, bytecode: object, linkReferences }
  }

  artifact(contractName: string, fileName?: string): Artifact {
    const buildInfoDir = this._dirAt(this.dir(), 'build-info')
    const builds: { [sourceName: string]: { [contractName: string]: CompilerOutputContract } } = this._existsFile(
      path.join(buildInfoDir, `${fileName || contractName}.json`)
    )
      ? this.buildInfo(contractName).output.contracts
      : this.buildInfos().reduce((result, info: BuildInfo) => ({ ...result, ...info.output.contracts }), {})

    const sourceName = Object.keys(builds).find((sourceName) =>
      Object.keys(builds[sourceName]).find((key) => key === contractName)
    )

    if (!sourceName) throw Error(`Could not find artifact for ${contractName}`)
    return builds[sourceName][contractName]
  }

  rawInput(): RawInputKeyValue {
    const taskInputPath = this._fileAt(this.dir(), 'input.ts')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rawInput = require(taskInputPath).default
    const globalInput = { ...rawInput }
    NETWORKS.forEach((network) => delete globalInput[network])
    const networkInput = rawInput[this.network] || {}
    return { ...globalInput, ...networkInput }
  }

  input(): Input {
    return this._parseRawInput(this.rawInput())
  }

  output({
    ensure = true,
    network,
    outputFile,
  }: { ensure?: boolean; network?: Network; outputFile?: string } = {}): Output {
    if (network) this.network = network
    const taskOutputDir = this._dirAt(this.dir(), 'output', ensure)
    const taskOutputFile = this._fileAt(taskOutputDir, outputFile || this.outputFile, ensure)
    return this._read(taskOutputFile)
  }

  save(output: RawOutput): void {
    const taskOutputDir = this._dirAt(this.dir(), 'output', false)
    if (!fs.existsSync(taskOutputDir)) fs.mkdirSync(taskOutputDir)

    const taskOutputFile = this._fileAt(taskOutputDir, this.outputFile, false)
    const previousOutput = this._read(taskOutputFile)

    const finalOutput = { ...previousOutput, ...this._parseRawOutput(output) }
    this._write(taskOutputFile, finalOutput)
  }

  delete(): void {
    const taskOutputDir = this._dirAt(this.dir(), 'output')
    const taskOutputFile = this._fileAt(taskOutputDir, this.outputFile)
    fs.unlinkSync(taskOutputFile)
  }

  private _parseRawInput(rawInput: RawInputKeyValue): Input {
    return Object.keys(rawInput).reduce((input: Input, key: string) => {
      const item = rawInput[key]
      if (Array.isArray(item)) input[key] = item
      else if (BigNumber.isBigNumber(item)) input[key] = item
      else if (typeof item !== 'object') input[key] = item
      else if (this._isTaskOutput(item)) {
        const task = item.task as Task
        const output = task.output({ network: this.network })
        const value = output[item.key]
        if (!value) throw Error(`Missing ${item.key} in output for task ${task.id}`)
        input[key] = value
      } else if (this._isTask(item)) {
        const task = item as Task
        const output = task.output({ network: this.network })
        const values = Object.values(output)
        if (values.length > 1 && !output[key]) throw Error(`Ambiguous or missing output "${key}" in task ${task.id}`)
        input[key] = values.length == 1 ? values[0] : output[key]
      } else input[key] = this._parseRawInput(item)
      return input
    }, {})
  }

  private _parseRawOutput(rawOutput: RawOutput): Output {
    return Object.keys(rawOutput).reduce((output: Output, key: string) => {
      const value = rawOutput[key]
      output[key] = typeof value === 'string' ? value : value.address
      return output
    }, {})
  }

  private _read(path: string): Output {
    return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path).toString()) : {}
  }

  private _write(path: string, output: Output): void {
    const finalOutputJSON = JSON.stringify(output, null, 2)
    fs.writeFileSync(path, finalOutputJSON)
  }

  private _fileAt(base: string, name: string, ensure = true): string {
    const filePath = path.join(base, name)
    if (ensure && !this._existsFile(filePath)) throw Error(`Could not find a file at ${filePath}`)
    return filePath
  }

  private _dirAt(base: string, name: string, ensure = true): string {
    const dirPath = path.join(base, name)
    if (ensure && !this._existsDir(dirPath)) throw Error(`Could not find a directory at ${dirPath}`)
    return dirPath
  }

  private _existsFile(filePath: string): boolean {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  }

  private _existsDir(dirPath: string): boolean {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _isTask(object: any): boolean {
    return object.constructor.name == 'Task'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _isTaskOutput(object: any): boolean {
    return object.task && object.key && this._isTask(object.task)
  }
}
