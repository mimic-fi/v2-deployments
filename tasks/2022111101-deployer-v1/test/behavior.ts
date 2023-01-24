import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

export default function itDeploysDeployerCorrectly(): void {
  let deployer: Contract

  before('load deployer', async function () {
    deployer = await this.task.deployedInstance('Deployer')
  })

  it('registers the Deployer lib under the expected namespace', async function () {
    const factory = await this.task.inputDeployedInstance('Create3Factory')

    const salt = ethers.utils.solidityKeccak256(['string'], [this.task.input().namespace])
    expect(await factory.addressOf(salt)).to.be.equal(deployer.address)
  })
}
