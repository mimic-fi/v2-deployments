import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { DeployerV4Deployment } from '../input'

export default function itDeploysDeployerV4Correctly(): void {
  let deployer: Contract

  before('load deployer', async function () {
    deployer = await this.task.deployedInstance('Deployer')
  })

  it('registers the Deployer lib under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const { namespace, version } = this.task.input() as DeployerV4Deployment
    const salt = ethers.utils.solidityKeccak256(['string'], [`${namespace}.Deployer.${version}`])
    expect(await factory.addressOf(salt)).to.be.equal(deployer.address)
  })
}
