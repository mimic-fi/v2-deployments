import { ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorL2Updates } from '../input'

/* eslint-disable no-secrets/no-secrets */

const WETH = '0x4200000000000000000000000000000000000006'
const DAI = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const USDC = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'

export default function itUpdatesBalancerFeeCollectorCorrectly(): void {
  let input: BalancerFeeCollectorL2Updates
  let smartVault: Contract, manager: Contract
  let oldClaimer: Contract, newClaimer: Contract, bptSwapper: Contract, bridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorL2Updates
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    bridger = await this.task.inputDeployedInstance('L2HopBridger')
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

  describe('bridger', () => {
    it('sets the requested AMMs', async () => {
      expect(await bridger.getTokenAmm(USDC)).not.to.be.equal(ZERO_ADDRESS)
      expect(await bridger.getTokenAmm(DAI)).to.be.equal(ZERO_ADDRESS)
      expect(await bridger.getTokenAmm(WETH)).to.be.equal(ZERO_ADDRESS)
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
      expect(await newClaimer.gasPriceLimit()).to.be.equal(0.5e9)
    })

    it('whitelists the requested relayers', async () => {
      expect(await newClaimer.isRelayer(input.relayer)).to.be.true
    })
  })

  describe('bpt swapper', () => {
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
      expect(await bptSwapper.gasPriceLimit()).to.be.equal(0.5e9)
    })

    it('whitelists the requested relayers', async () => {
      expect(await bptSwapper.isRelayer(input.relayer)).to.be.true
    })
  })
}
