import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { ParaswapFeeRedistributorSetupL2HopBridger } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itInstallsPublicSwapperFeeCollectorBridgerBnbCorrectly(): void {
  let input: ParaswapFeeRedistributorSetupL2HopBridger
  let smartVault: Contract, manager: Contract, bridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as ParaswapFeeRedistributorSetupL2HopBridger
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    bridger = await this.task.deployedInstance('L2HopBridger')
  })

  describe('smart vault', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(smartVault, [{ name: 'bridger', account: bridger, roles: ['bridge', 'withdraw'] }])
    })
  })

  describe('l2 hop bridger', () => {
    it('has the expected address', async () => {
      expect(bridger.address).to.be.equal('0x88BA0f52E49D0cFaCa15F9ec09c33c6204D4E630')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(bridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper destination chain ID', async () => {
      expect(await bridger.destinationChainId()).to.be.equal(input.l2HopBridger.destinationChainId)
    })

    it('sets the proper max deadline', async () => {
      expect(await bridger.maxDeadline()).to.be.equal(input.l2HopBridger.maxDeadline)
    })

    it('sets the proper max slippage', async () => {
      expect(await bridger.maxSlippage()).to.be.equal(input.l2HopBridger.maxSlippage)
    })

    it('sets the proper max bonder fee pct', async () => {
      expect(await bridger.maxBonderFeePct()).to.be.equal(input.l2HopBridger.maxBonderFeePct)
    })

    it('sets the requested AMMs', async () => {
      for (const { token, amm } of input.l2HopBridger.hopAmmParams) {
        expect(await bridger.getTokenAmm(token)).to.be.equal(amm)
      }
    })

    it('sets the expected gas limits', async () => {
      expect(await bridger.txCostLimit()).to.be.equal(0)
      expect(await bridger.gasPriceLimit()).to.be.equal(input.l2HopBridger.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await bridger.thresholdToken()).to.be.equal(input.l2HopBridger.thresholdToken)
      expect(await bridger.thresholdAmount()).to.be.equal(input.l2HopBridger.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await bridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
