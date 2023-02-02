import { fp, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'
const USDC = '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
const USDT = '0x049d68029688eabf473097a2fc38ef61633a3c7a'
const WETH = '0x74b23882a30290451A17c44f4F05243b6b58C76d'
const WFTM = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'

const CHAINLINK_ORACLE_DAI_USD = '0x91d5DEFAFfE2854C7D02F50c80FA1fdc8A721e52'
const CHAINLINK_ORACLE_USDC_USD = '0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c'
const CHAINLINK_ORACLE_USDT_USD = '0xF64b636c5dFe1d3555A847341cDC449f612307d0'
const CHAINLINK_ORACLE_ETH_USD = '0x11DdD3d147E5b83D01cee7070027092397d63658'
const CHAINLINK_ORACLE_FTM_USD = '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc'

export default function itDeploysMimicFeeCollectorCorrectly(): void {
  let input: MimicFeeCollectorDeployment
  let smartVault: Contract, holder: Contract, funder: Contract
  let owner: string, bot: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorDeployment
    ;({ owner, managers, bot } = input.accounts)
  })

  before('load instances', async function () {
    holder = await this.task.deployedInstance('Holder')
    funder = await this.task.deployedInstance('Funder')
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

    it('does not set a bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(ZERO_ADDRESS)
    })

    it('sets the expected price feeds', async function () {
      expect(await smartVault.getPriceFeed(DAI, USD)).to.be.equal(CHAINLINK_ORACLE_DAI_USD)
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_ORACLE_USDC_USD)
      expect(await smartVault.getPriceFeed(USDT, USD)).to.be.equal(CHAINLINK_ORACLE_USDT_USD)
      expect(await smartVault.getPriceFeed(WETH, USD)).to.be.equal(CHAINLINK_ORACLE_ETH_USD)
      expect(await smartVault.getPriceFeed(WFTM, USD)).to.be.equal(CHAINLINK_ORACLE_FTM_USD)
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
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await funder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token balance limits', async function () {
      expect(await funder.minBalance()).to.be.equal(fp(1.5))
      expect(await funder.maxBalance()).to.be.equal(fp(15))
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
}
