import { DAY, fp, NATIVE_TOKEN_ADDRESS, toUSDC } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorUpdatesOptimism } from '../input'

/* eslint-disable no-secrets/no-secrets */

const RECIPIENT = '0x2a185C8A3C63d7bFe63aD5d950244FFe9d0a4b60'
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
const PROTOCOL_FEE_WITHDRAWER = '0xC128a9954e6c874eA3d62ce62B468bA073093F25'

const BAL = '0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921'
const USDC = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'

export default function itUpdatesBalancerFeeCollectorOptimismCorrectly(): void {
  let input: BalancerFeeCollectorUpdatesOptimism
  let smartVault: Contract, manager: Contract
  let claimer: Contract, bptSwapper: Contract, oneInchSwapper: Contract, paraswapSwapper: Contract, withdrawer: Contract

  before('load input', async function () {
    input = this.task.input() as BalancerFeeCollectorUpdatesOptimism
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    claimer = await this.task.deployedInstance('Claimer')
    bptSwapper = await this.task.deployedInstance('BPTSwapper')
    oneInchSwapper = await this.task.deployedInstance('OneInchV5Swapper')
    paraswapSwapper = await this.task.deployedInstance('ParaswapV5Swapper')
    withdrawer = await this.task.deployedInstance('Withdrawer')
  })

  describe('permissions manager', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['execute'] },
        { name: 'mimic', account: input.mimic, roles: ['execute'] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: 'bpt swapper', account: bptSwapper, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('sets new actions permissions', async () => {
      await assertPermissions(smartVault, [
        { name: 'claimer', account: claimer, roles: ['call', 'withdraw'] },
        { name: 'bpt swapper', account: bptSwapper, roles: ['call', 'withdraw'] },
        { name: '1inch swapper', account: oneInchSwapper, roles: ['swap', 'withdraw'] },
        { name: 'psp swapper', account: paraswapSwapper, roles: ['swap', 'withdraw'] },
        { name: 'withdrawer', account: withdrawer, roles: ['withdraw'] },
      ])
    })

    it('unsets old actions permissions', async () => {
      await assertPermissions(smartVault, [
        { name: 'old claimer', account: input.Claimer, roles: [] },
        { name: 'old bpt swapper', account: input.BPTSwapper, roles: [] },
        { name: 'old 1inch swapper', account: input.OneInchSwapper, roles: [] },
        { name: 'old psp swapper', account: input.ParaswapSwapper, roles: [] },
        { name: 'old hop bridger', account: input.L2HopBridger, roles: [] },
      ])
    })
  })

  describe('claimer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(claimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayers', account: input.claimer.actionConfig.relayConfig.relayers, roles: ['call'] },
      ])
    })

    it('sets the expected protocol fee withdrawer', async () => {
      expect(await claimer.protocolFeeWithdrawer()).to.be.equal(PROTOCOL_FEE_WITHDRAWER)
    })

    it('has the expected basic config', async () => {
      expect(await claimer.smartVault()).to.be.equal(smartVault.address)
      expect(await claimer.getGroupId()).to.be.equal(0)
    })

    it('sets the expected oracle config', async () => {
      for (const relayer of input.claimer.actionConfig.relayConfig.relayers) {
        expect(await claimer.isOracleSigner(relayer)).to.be.true
      }
    })

    it('sets the expected relayer config', async () => {
      const gasLimits = await claimer.getRelayGasLimits()
      expect(gasLimits.gasPriceLimit).to.be.equal(0.5e9)
      expect(gasLimits.priorityFeeLimit).to.be.equal(0)

      expect(await claimer.getRelayGasToken()).to.be.equal(USDC)
      expect(await claimer.getRelayTxCostLimit()).to.be.equal(0)
      expect(await claimer.isRelayPermissiveModeActive()).to.be.true

      for (const relayer of input.claimer.actionConfig.relayConfig.relayers) {
        expect(await claimer.isRelayer(relayer)).to.be.true
      }
    })

    it('sets the expected time-lock config', async () => {
      const timeLock = await claimer.getTimeLock()
      expect(timeLock.delay).to.be.equal(0)
      expect(timeLock.expiresAt).to.be.equal(0)
    })

    it('sets the expected token index config', async () => {
      expect(await claimer.getTokensAcceptanceType()).to.be.equal(0)
      expect(await claimer.getTokensAcceptanceList()).to.have.lengthOf(0)

      const sources = await claimer.getTokensIndexSources()
      expect(sources).to.be.have.lengthOf(1)
      expect(sources[0]).to.be.equal(PROTOCOL_FEE_WITHDRAWER)
    })

    it('sets the expected token threshold params', async () => {
      const threshold = await claimer.getDefaultTokenThreshold()
      expect(threshold.token).to.be.equal(USDC)
      expect(threshold.min).to.be.equal(toUSDC(100))
      expect(threshold.max).to.be.equal(0)
    })
  })

  describe('bpt swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(bptSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayers', account: input.bptSwapper.actionConfig.relayConfig.relayers, roles: ['call'] },
      ])
    })

    it('sets the expected balancer vault', async () => {
      expect(await bptSwapper.balancerVault()).to.be.equal(BALANCER_VAULT)
    })

    it('has the expected basic config', async () => {
      expect(await bptSwapper.smartVault()).to.be.equal(smartVault.address)
      expect(await bptSwapper.getGroupId()).to.be.equal(0)
    })

    it('sets the expected oracle config', async () => {
      for (const relayer of input.bptSwapper.actionConfig.relayConfig.relayers) {
        expect(await bptSwapper.isOracleSigner(relayer)).to.be.true
      }
    })

    it('sets the expected relayer config', async () => {
      const gasLimits = await bptSwapper.getRelayGasLimits()
      expect(gasLimits.gasPriceLimit).to.be.equal(0.5e9)
      expect(gasLimits.priorityFeeLimit).to.be.equal(0)

      expect(await bptSwapper.getRelayGasToken()).to.be.equal(USDC)
      expect(await bptSwapper.getRelayTxCostLimit()).to.be.equal(0)
      expect(await bptSwapper.isRelayPermissiveModeActive()).to.be.true

      for (const relayer of input.bptSwapper.actionConfig.relayConfig.relayers) {
        expect(await bptSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('sets the expected time-lock config', async () => {
      const timeLock = await bptSwapper.getTimeLock()
      expect(timeLock.delay).to.be.equal(0)
      expect(timeLock.expiresAt).to.be.equal(0)
    })

    it('sets the expected token index config', async () => {
      expect(await bptSwapper.getTokensAcceptanceType()).to.be.equal(0)
      expect(await bptSwapper.getTokensAcceptanceList()).to.have.lengthOf(0)
      expect(await bptSwapper.getTokensIndexSources()).to.be.have.lengthOf(0)
    })

    it('sets the expected token threshold params', async () => {
      const threshold = await bptSwapper.getDefaultTokenThreshold()
      expect(threshold.token).to.be.equal(USDC)
      expect(threshold.min).to.be.equal(toUSDC(100))
      expect(threshold.max).to.be.equal(0)
    })
  })

  describe('1inch swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(oneInchSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayers', account: input.oneInchSwapper.actionConfig.relayConfig.relayers, roles: ['call'] },
      ])
    })

    it('has the expected basic config', async () => {
      expect(await oneInchSwapper.smartVault()).to.be.equal(smartVault.address)
      expect(await oneInchSwapper.getGroupId()).to.be.equal(1)
    })

    it('sets the expected swapper config', async () => {
      expect(await oneInchSwapper.getDefaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await oneInchSwapper.getDefaultTokenOut()).to.be.equal(USDC)
    })

    it('sets the expected oracle config', async () => {
      for (const relayer of input.oneInchSwapper.actionConfig.relayConfig.relayers) {
        expect(await oneInchSwapper.isOracleSigner(relayer)).to.be.true
      }
    })

    it('sets the expected relayer config', async () => {
      const gasLimits = await oneInchSwapper.getRelayGasLimits()
      expect(gasLimits.gasPriceLimit).to.be.equal(0.5e9)
      expect(gasLimits.priorityFeeLimit).to.be.equal(0)

      expect(await oneInchSwapper.getRelayGasToken()).to.be.equal(USDC)
      expect(await oneInchSwapper.getRelayTxCostLimit()).to.be.equal(0)
      expect(await oneInchSwapper.isRelayPermissiveModeActive()).to.be.true

      for (const relayer of input.oneInchSwapper.actionConfig.relayConfig.relayers) {
        expect(await oneInchSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('sets the expected time-lock config', async () => {
      const timeLock = await oneInchSwapper.getTimeLock()
      expect(timeLock.delay).to.be.equal(0)
      expect(timeLock.expiresAt).to.be.equal(0)
    })

    it('sets the expected token index config', async () => {
      expect(await oneInchSwapper.getTokensAcceptanceType()).to.be.equal(0)

      const deniedTokens = await oneInchSwapper.getTokensAcceptanceList()
      expect(deniedTokens).to.have.lengthOf(3)
      expect(deniedTokens).to.include(USDC)
      expect(deniedTokens).to.include(BAL)
      expect(deniedTokens).to.include(NATIVE_TOKEN_ADDRESS)

      expect(await oneInchSwapper.getTokensIndexSources()).to.be.have.lengthOf(0)
    })

    it('sets the expected token threshold params', async () => {
      const threshold = await oneInchSwapper.getDefaultTokenThreshold()
      expect(threshold.token).to.be.equal(USDC)
      expect(threshold.min).to.be.equal(toUSDC(100))
      expect(threshold.max).to.be.equal(0)
    })
  })

  describe('paraswap swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(paraswapSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        {
          name: 'relayers',
          account: input.paraswapSwapper.swapperConfig.actionConfig.relayConfig.relayers,
          roles: ['call'],
        },
      ])
    })

    it('has the expected basic config', async () => {
      expect(await paraswapSwapper.smartVault()).to.be.equal(smartVault.address)
      expect(await paraswapSwapper.getGroupId()).to.be.equal(1)
    })

    it('sets the expected swapper config', async () => {
      expect(await paraswapSwapper.getQuoteSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
      expect(await paraswapSwapper.getDefaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await paraswapSwapper.getDefaultTokenOut()).to.be.equal(USDC)
    })

    it('sets the expected oracle config', async () => {
      for (const relayer of input.paraswapSwapper.swapperConfig.actionConfig.relayConfig.relayers) {
        expect(await paraswapSwapper.isOracleSigner(relayer)).to.be.true
      }
    })

    it('sets the expected relayer config', async () => {
      const gasLimits = await paraswapSwapper.getRelayGasLimits()
      expect(gasLimits.gasPriceLimit).to.be.equal(0.5e9)
      expect(gasLimits.priorityFeeLimit).to.be.equal(0)

      expect(await paraswapSwapper.getRelayGasToken()).to.be.equal(USDC)
      expect(await paraswapSwapper.getRelayTxCostLimit()).to.be.equal(0)
      expect(await paraswapSwapper.isRelayPermissiveModeActive()).to.be.true

      for (const relayer of input.paraswapSwapper.swapperConfig.actionConfig.relayConfig.relayers) {
        expect(await paraswapSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('sets the expected time-lock config', async () => {
      const timeLock = await paraswapSwapper.getTimeLock()
      expect(timeLock.delay).to.be.equal(0)
      expect(timeLock.expiresAt).to.be.equal(0)
    })

    it('sets the expected token index config', async () => {
      expect(await paraswapSwapper.getTokensAcceptanceType()).to.be.equal(0)

      const deniedTokens = await paraswapSwapper.getTokensAcceptanceList()
      expect(deniedTokens).to.have.lengthOf(3)
      expect(deniedTokens).to.include(USDC)
      expect(deniedTokens).to.include(BAL)
      expect(deniedTokens).to.include(NATIVE_TOKEN_ADDRESS)

      expect(await paraswapSwapper.getTokensIndexSources()).to.be.have.lengthOf(0)
    })

    it('sets the expected token threshold params', async () => {
      const threshold = await paraswapSwapper.getDefaultTokenThreshold()
      expect(threshold.token).to.be.equal(USDC)
      expect(threshold.min).to.be.equal(toUSDC(100))
      expect(threshold.max).to.be.equal(0)
    })
  })

  describe('withdrawer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayers', account: input.withdrawer.actionConfig.relayConfig.relayers, roles: ['call'] },
      ])
    })

    it('has the expected basic config', async () => {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
      expect(await withdrawer.getGroupId()).to.be.equal(0)
    })

    it('sets the expected withdrawer config', async () => {
      expect(await withdrawer.getRecipient()).to.be.equal(RECIPIENT)
    })

    it('sets the expected oracle config', async () => {
      for (const relayer of input.withdrawer.actionConfig.relayConfig.relayers) {
        expect(await withdrawer.isOracleSigner(relayer)).to.be.true
      }
    })

    it('sets the expected relayer config', async () => {
      const gasLimits = await withdrawer.getRelayGasLimits()
      expect(gasLimits.gasPriceLimit).to.be.equal(0)
      expect(gasLimits.priorityFeeLimit).to.be.equal(0)

      expect(await withdrawer.getRelayGasToken()).to.be.equal(USDC)
      expect(await withdrawer.getRelayTxCostLimit()).to.be.equal(0)
      expect(await withdrawer.isRelayPermissiveModeActive()).to.be.true

      for (const relayer of input.withdrawer.actionConfig.relayConfig.relayers) {
        expect(await withdrawer.isRelayer(relayer)).to.be.true
      }
    })

    it('sets the expected time-lock config', async () => {
      const timeLock = await withdrawer.getTimeLock()
      expect(timeLock.delay).to.be.equal(14 * DAY)
      expect(timeLock.expiresAt).to.be.equal(1686304800)
    })

    it('sets the expected token index config', async () => {
      expect(await withdrawer.getTokensAcceptanceType()).to.be.equal(1)

      const tokens = await withdrawer.getTokensAcceptanceList()
      expect(tokens).to.have.lengthOf(2)
      expect(tokens).to.include(USDC)
      expect(tokens).to.include(BAL)

      expect(await withdrawer.getTokensIndexSources()).to.be.have.lengthOf(0)
    })

    it('sets the expected token threshold params', async () => {
      const threshold = await withdrawer.getDefaultTokenThreshold()
      expect(threshold.token).to.be.equal(USDC)
      expect(threshold.min).to.be.equal(0)
      expect(threshold.max).to.be.equal(0)
    })
  })
}
