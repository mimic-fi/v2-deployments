import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
const USDC = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
const USDT = '0x4ECaBa5870353805a9F068101A40E0f32ed605C6'
const WETH = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'

const HOP_DAI_AMM = '0x6C928f435d1F3329bABb42d69CCF043e3900EcF1'
const HOP_USDC_AMM = '0x76b22b8C1079A44F1211D867D68b1eda76a635A7'
const HOP_USDT_AMM = '0x49094a1B3463c4e2E82ca41b8e6A023bdd6E222f'
const HOP_WETH_AMM = '0x03D7f750777eC48d39D080b020D83Eb2CB4e3547'

const CHAINLINK_ORACLE_DAI_USD = '0x678df3415fc31947dA4324eC63212874be5a82f8'
const CHAINLINK_ORACLE_WETH_USD = '0xa767f745331D267c7751297D982b050c93985627'
const CHAINLINK_ORACLE_USDC_USD = '0x26C31ac71010aF62E6B486D1132E266D6298857D'
const CHAINLINK_ORACLE_USDT_USD = '0x68811D7DF835B1c33e6EEae8E7C141eF48d48cc7'

export function itDeploysMimicFeeCollectorCorrectly(): void {
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
    it('has the same address as the L1 smart vault', async function () {
      expect(smartVault.address).to.be.equal('0x4629C578a9e49Ef4AaABFeE03F238cB11625F78B')
    })

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

    it('sets the expected price feeds', async function () {
      expect(await smartVault.getPriceFeed(WXDAI, USD)).to.be.equal(CHAINLINK_ORACLE_DAI_USD)
      expect(await smartVault.getPriceFeed(WETH, USD)).to.be.equal(CHAINLINK_ORACLE_WETH_USD)
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_ORACLE_USDC_USD)
      expect(await smartVault.getPriceFeed(USDT, USD)).to.be.equal(CHAINLINK_ORACLE_USDT_USD)
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
      expect(await funder.minBalance()).to.be.equal(fp(0.04))
      expect(await funder.maxBalance()).to.be.equal(fp(0.4))
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
      expect(await holder.thresholdAmount()).to.be.equal(toUSDC(50))
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
      expect(await swapper.getTokenAmm(WXDAI)).to.be.equal(HOP_DAI_AMM)
      expect(await swapper.getTokenAmm(WETH)).to.be.equal(HOP_WETH_AMM)
      expect(await swapper.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
      expect(await swapper.getTokenAmm(USDT)).to.be.equal(HOP_USDT_AMM)
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
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(50))
    })

    it('allows the requested chains', async function () {
      expect(await bridger.isChainAllowed(1)).to.be.true
      expect(await bridger.isChainAllowed(10)).to.be.true
      expect(await bridger.isChainAllowed(137)).to.be.true
      expect(await bridger.isChainAllowed(42161)).to.be.true
      expect(await bridger.isChainAllowed(100)).to.be.false
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
