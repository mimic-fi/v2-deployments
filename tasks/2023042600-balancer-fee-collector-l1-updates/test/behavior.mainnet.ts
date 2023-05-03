import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorL1Updates } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesBalancerFeeCollectorCorrectly(): void {
  let input: BalancerFeeCollectorL1Updates
  let smartVault: Contract, manager: Contract
  let oldClaimer: Contract, newClaimer: Contract, bptSwapper: Contract

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorL1Updates
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    oldClaimer = await this.task.inputDeployedInstance('Claimer')
    newClaimer = await this.task.deployedInstance('Claimer')
    bptSwapper = await this.task.deployedInstance('BPTSwapper')
  })

  describe('smart vault', () => {
    it('updates its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'old claimer', account: oldClaimer, roles: [] },
        { name: 'new claimer', account: newClaimer, roles: ['call', 'withdraw'] },
        { name: 'bpt swapper', account: bptSwapper, roles: ['call', 'withdraw'] },
      ])
    })
  })

  describe('old claimer', () => {
    it('updates its permissions correctly', async () => {
      await assertPermissions(oldClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: [] },
        { name: 'relayer', account: input.relayer, roles: [] },
      ])
    })
  })

  describe('new claimer', () => {
    it('has the expected address', async () => {
      expect(newClaimer.address).to.be.equal('0xdF818E63341767d5F5A9827088f1892e9C604A2D')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(newClaimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setProtocolFeeWithdrawer',
            'setPermissiveRelayedMode',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setPayingGasToken',
            'call',
          ],
        },
        { name: 'old claimer', account: oldClaimer, roles: [] },
        { name: 'bpt swapper', account: bptSwapper, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await newClaimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper protocol fee withdrawer', async () => {
      expect(await newClaimer.protocolFeeWithdrawer()).to.be.equal(await oldClaimer.protocolFeeWithdrawer())
    })

    it('sets the proper oracle signer', async () => {
      expect(await newClaimer.isOracleSigner(input.relayer)).to.be.true
    })

    it('sets the proper paying gas token', async () => {
      expect(await newClaimer.payingGasToken()).to.be.equal(await oldClaimer.thresholdToken())
    })

    it('sets the expected token threshold params', async () => {
      expect(await newClaimer.thresholdToken()).to.be.equal(await oldClaimer.thresholdToken())
      expect(await newClaimer.thresholdAmount()).to.be.equal(await oldClaimer.thresholdAmount())
    })

    it('sets the expected limits', async () => {
      expect(await newClaimer.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      expect(await newClaimer.isRelayer(input.relayer)).to.be.true
    })
  })

  describe('bpt swapper', () => {
    it('has the expected address', async () => {
      expect(bptSwapper.address).to.be.equal('0x6030331C9225Ee5ae3F3D08FBD19e8bF053dF498')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(bptSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: input.owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setPermissiveRelayedMode',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setPayingGasToken',
            'call',
          ],
        },
        { name: 'old claimer', account: oldClaimer, roles: [] },
        { name: 'new claimer', account: newClaimer, roles: [] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bptSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper oracle signer', async () => {
      expect(await bptSwapper.isOracleSigner(input.relayer)).to.be.true
    })

    it('sets the proper paying gas token', async () => {
      expect(await bptSwapper.payingGasToken()).to.be.equal(await oldClaimer.thresholdToken())
    })

    it('sets the expected token threshold params', async () => {
      expect(await bptSwapper.thresholdToken()).to.be.equal(await oldClaimer.thresholdToken())
      expect(await bptSwapper.thresholdAmount()).to.be.equal(await oldClaimer.thresholdAmount())
    })

    it('sets the expected limits', async () => {
      expect(await bptSwapper.gasPriceLimit()).to.be.equal(100e9)
    })

    it('whitelists the requested relayers', async () => {
      expect(await bptSwapper.isRelayer(input.relayer)).to.be.true
    })
  })
}
