import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

export default function itBehavesLikeCreate3Factory(): void {
  let factory: Contract

  before('load factory', async function () {
    factory = await this.task.deployedInstance('Create3Factory')
  })

  const getRandomSalt = () => {
    const bytes = ethers.utils.randomBytes(32)
    return ethers.utils.hexlify(bytes)
  }

  const getRandomContractCode = (size: number): { bytecode: string; creationCode: string } => {
    const bytes = ethers.utils.randomBytes(size)
    if (bytes[0] === 239) bytes[0] = 240 // 0xef forbidden by EIP-3541
    const bytecode = ethers.utils.hexlify(bytes)
    const creationCode = `0x63${size.toString(16).padStart(8, '0')}80600E6000396000F3${bytecode.slice(2)}`
    return { creationCode, bytecode }
  }

  context('when the salt was not used', () => {
    it('creates contract', async function () {
      const salt = getRandomSalt()
      const { bytecode, creationCode } = getRandomContractCode(911)

      await factory.create3(salt, creationCode)

      const address = await factory.addressOf(salt)
      expect(await ethers.provider.getCode(address)).to.equal(bytecode)
    })

    it('can reuse the same salt from a different factory', async function () {
      const anotherFactory = await this.task.deploy('Create3Factory')
      const { creationCode, bytecode } = getRandomContractCode(911)

      const salt = getRandomSalt()
      const address = await factory.addressOf(salt)
      const anotherAddress = await anotherFactory.addressOf(salt)
      expect(address).to.not.be.equal(anotherAddress)

      await factory.create3(salt, creationCode)
      expect(await ethers.provider.getCode(address)).to.equal(bytecode)

      await anotherFactory.create3(salt, creationCode)
      expect(await ethers.provider.getCode(anotherAddress)).to.equal(bytecode)
    })
  })

  context('when the salt was already used', () => {
    const salt = getRandomSalt()

    beforeEach('create contract', async function () {
      const { creationCode } = getRandomContractCode(911)
      await factory.create3(salt, creationCode)
    })

    it('reverts', async function () {
      const { creationCode } = getRandomContractCode(911)

      await expect(factory.create3(salt, creationCode)).to.be.revertedWith('CREATE3_TARGET_ALREADY_EXISTS')
    })
  })
}
