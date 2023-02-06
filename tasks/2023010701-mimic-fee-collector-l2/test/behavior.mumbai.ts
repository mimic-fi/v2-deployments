import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0x6D4dd09982853F08d9966aC3cA4Eb5885F16f2b2'
const WETH = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
const WMATIC = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
const HOP_USDC_AMM = '0xa81D244A1814468C734E5b4101F7b9c0c577a8fC'
const HOP_WETH_AMM = '0x0e0E3d2C5c292161999474247956EF542caBF8dd'
const CHAINLINK_MATIC_USD = '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'

export default function itDeploysMimicFeeCollectorCorrectly(): void {
  let input: MimicFeeCollectorDeployment
  let smartVault: Contract, holder: Contract, funder: Contract, bridger: Contract, swapper: Contract
  let owner: string, bot: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorDeployment
    ;({ owner, managers, bot } = input.accounts)
  })

  before('load instances', async function () {
    holder = await this.task.deployedInstance('Holder')
    funder = await this.task.deployedInstance('Funder')
    bridger = await this.task.deployedInstance('L2HopBridger')
    swapper = await this.task.deployedInstance('L2HopSwapper')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('smart vault', () => {
    it('uses the correct implementation', async function () {
      const smartVaultsFactory = await this.task.inputDeployedInstance('SmartVaultsFactory')
      const implementation = await smartVaultsFactory.implementationOf(smartVault.address)
      expect(implementation).to.be.equal(input.params.smartVaultParams.impl)
    })

    it('has set its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'collect',
            'withdraw',
            'wrap',
            'unwrap',
            'claim',
            'join',
            'exit',
            'swap',
            'bridge',
            'setStrategy',
            'setPriceFeed',
            'setPriceFeeds',
            'setPriceOracle',
            'setFeeCollector',
            'setSwapConnector',
            'setBridgeConnector',
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'funder', account: funder, roles: ['swap', 'unwrap', 'withdraw'] },
        { name: 'holder', account: holder, roles: ['wrap', 'swap'] },
        { name: 'swapper', account: swapper, roles: ['swap'] },
        { name: 'bridger', account: bridger, roles: ['bridge'] },
        { name: 'managers', account: managers, roles: [] },
      ])
    })

    it('sets no fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(ZERO_ADDRESS)
    })

    it('sets no bridge fee', async function () {
      const bridgeFee = await smartVault.bridgeFee()

      expect(bridgeFee.pct).to.be.equal(0)
      expect(bridgeFee.cap).to.be.equal(0)
      expect(bridgeFee.token).to.be.equal(ZERO_ADDRESS)
      expect(bridgeFee.period).to.be.equal(0)
    })

    it('sets no swap fee', async function () {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(0)
      expect(swapFee.cap).to.be.equal(0)
      expect(swapFee.token).to.be.equal(ZERO_ADDRESS)
      expect(swapFee.period).to.be.equal(0)
    })

    it('sets no withdraw fee', async function () {
      const withdrawFee = await smartVault.withdrawFee()

      expect(withdrawFee.pct).to.be.equal(0)
      expect(withdrawFee.cap).to.be.equal(0)
      expect(withdrawFee.token).to.be.equal(ZERO_ADDRESS)
      expect(withdrawFee.period).to.be.equal(0)
    })

    it('sets no performance fee', async function () {
      const performanceFee = await smartVault.performanceFee()

      expect(performanceFee.pct).to.be.equal(0)
      expect(performanceFee.cap).to.be.equal(0)
      expect(performanceFee.token).to.be.equal(ZERO_ADDRESS)
      expect(performanceFee.period).to.be.equal(0)
    })

    it('sets a price oracle', async function () {
      expect(await smartVault.priceOracle()).to.be.equal(input.params.smartVaultParams.priceOracle)
    })

    it('sets a swap connector', async function () {
      expect(await smartVault.swapConnector()).to.be.equal(input.params.smartVaultParams.swapConnector)
    })

    it('sets a bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.params.smartVaultParams.bridgeConnector)
    })

    it('sets a price feed for WMATIC-USDC', async function () {
      expect(await smartVault.getPriceFeed(WMATIC, USDC)).to.be.equal(CHAINLINK_MATIC_USD)
    })
  })

  describe('funder', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(funder, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setTokenIn',
            'setMaxSlippage',
            'setBalanceLimits',
            'setRecipient',
            'call',
          ],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await funder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token balance limits', async function () {
      expect(await funder.minBalance()).to.be.equal(fp(0.3))
      expect(await funder.maxBalance()).to.be.equal(fp(2))
    })

    it('sets the requested max slippage', async function () {
      expect(await funder.maxSlippage()).to.be.equal(fp(0.001))
    })

    it('sets the requested recipient', async function () {
      expect(await funder.recipient()).to.be.equal(bot)
    })
  })

  describe('holder', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(holder, [
        {
          name: 'owner',
          account: owner,
          roles: ['authorize', 'unauthorize', 'setSmartVault', 'setThreshold', 'setMaxSlippage', 'setTokenOut', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await holder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async function () {
      expect(await holder.thresholdToken()).to.be.equal(USDC)
      expect(await holder.thresholdAmount()).to.be.equal(toUSDC(5))
    })

    it('sets the requested token out', async function () {
      expect(await holder.tokenOut()).to.be.equal(USDC)
    })

    it('sets the requested max slippage', async function () {
      expect(await holder.maxSlippage()).to.be.equal(fp(0.002))
    })
  })

  describe('swapper', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(swapper, [
        {
          name: 'owner',
          account: owner,
          roles: ['authorize', 'unauthorize', 'setSmartVault', 'setMaxSlippage', 'setTokenAmm', 'call'],
        },
        { name: 'bot', account: bot, roles: ['call'] },
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await swapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the requested AMMs', async function () {
      expect(await swapper.getTokenAmm(owner)).to.be.equal(ZERO_ADDRESS)
      expect(await swapper.getTokenAmm(WETH)).to.be.equal(HOP_WETH_AMM)
      expect(await swapper.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
    })

    it('sets the requested max slippage', async function () {
      expect(await swapper.maxSlippage()).to.be.equal(fp(0.002))
    })
  })

  describe('bridger', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(bridger, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setThreshold',
            'setMaxSlippage',
            'setMaxDeadline',
            'setMaxBonderFeePct',
            'setAllowedChain',
            'setTokenAmm',
            'call',
          ],
        },
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async function () {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(5))
    })

    it('allows the requested chains', async function () {
      expect(await bridger.isChainAllowed(5)).to.be.true
      expect(await bridger.isChainAllowed(10)).to.be.false
    })

    it('sets the requested AMMs', async function () {
      expect(await bridger.getTokenAmm(owner)).to.be.equal(ZERO_ADDRESS)
      expect(await bridger.getTokenAmm(WETH)).to.be.equal(HOP_WETH_AMM)
      expect(await bridger.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
    })

    it('sets the requested maximums', async function () {
      expect(await bridger.maxDeadline()).to.be.equal(2 * HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.002))
      expect(await bridger.maxBonderFeePct()).to.be.equal(fp(0.03))
    })
  })
}
