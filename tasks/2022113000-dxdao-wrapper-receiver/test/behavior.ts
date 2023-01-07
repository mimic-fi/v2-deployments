import { fp, impersonate } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

import { DXDaoWrapperReceiverDeployment } from '../input'

export function itDeploysSwapConnectorCorrectly(): void {
  let receiver: Contract, smartVault: string, input: DXDaoWrapperReceiverDeployment

  before('load input', async function () {
    input = this.task.input() as DXDaoWrapperReceiverDeployment
    smartVault = input.SmartVault
  })

  before('load instances', async function () {
    receiver = await this.task.deployedInstance('Receiver')
  })

  describe('receiver', () => {
    it('has the proper smart vault set', async () => {
      expect(await receiver.smartVault()).to.be.equal(smartVault)
    })

    it('forwards ETH to the smart vault', async () => {
      const amount = fp(10)
      const sender = await impersonate(input.from, amount.mul(2))
      await sender.sendTransaction({ to: receiver.address, value: amount })

      const previousActionBalance = await ethers.provider.getBalance(receiver.address)
      const previousSmartVaultBalance = await ethers.provider.getBalance(smartVault)

      await receiver.call()

      const currentActionBalance = await ethers.provider.getBalance(receiver.address)
      expect(currentActionBalance).to.be.equal(previousActionBalance.sub(amount))

      const currentSmartVaultBalance = await ethers.provider.getBalance(smartVault)
      expect(currentSmartVaultBalance).to.be.equal(previousSmartVaultBalance.add(amount))
    })
  })
}
