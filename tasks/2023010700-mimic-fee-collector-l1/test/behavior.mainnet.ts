import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const HOP_ETH_BRIDGE = '0xb8901acB165ed027E32754E0FFe830802919727f'
const HOP_DAI_BRIDGE = '0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1'
const HOP_USDT_BRIDGE = '0x3E4a3a4796d16c0Cd582C382691998f7c06420B6'
const HOP_USDC_BRIDGE = '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a'

const CHAINLINK_ORACLE_DAI_ETH = '0x773616E4d11A78F511299002da57A0a94577F1f4'
const CHAINLINK_ORACLE_USDT_ETH = '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46'
const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

export function itDeploysMimicFeeCollectorCorrectly(): void {
  let input: MimicFeeCollectorDeployment
  let smartVault: Contract, holder: Contract, funder: Contract, bridger: Contract
  let owner: string, bot: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorDeployment
    ;({ owner, managers, bot } = input.accounts)
  })

  before('load instances', async function () {
    holder = await this.task.deployedInstance('Holder')
    funder = await this.task.deployedInstance('Funder')
    bridger = await this.task.deployedInstance('L1HopBridger')
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
      expect(await smartVault.getPriceFeed(DAI, WETH)).to.be.equal(CHAINLINK_ORACLE_DAI_ETH)
      expect(await smartVault.getPriceFeed(USDC, WETH)).to.be.equal(CHAINLINK_ORACLE_USDC_ETH)
      expect(await smartVault.getPriceFeed(USDT, WETH)).to.be.equal(CHAINLINK_ORACLE_USDT_ETH)
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
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await funder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token in', async function () {
      expect(await funder.tokenIn()).to.be.equal(USDC)
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
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await holder.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async function () {
      expect(await holder.thresholdToken()).to.be.equal(USDC)
      expect(await holder.thresholdAmount()).to.be.equal(toUSDC(200))
    })

    it('sets the requested token out', async function () {
      expect(await holder.tokenOut()).to.be.equal(USDC)
    })

    it('sets the requested max slippage', async function () {
      expect(await holder.maxSlippage()).to.be.equal(fp(0.002))
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
            'setMaxRelayerFeePct',
            'setAllowedChain',
            'setTokenBridge',
            'call',
          ],
        },
        { name: 'funder', account: funder, roles: [] },
        { name: 'holder', account: holder, roles: [] },
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
      expect(await bridger.isChainAllowed(10)).to.be.true
      expect(await bridger.isChainAllowed(137)).to.be.true
      expect(await bridger.isChainAllowed(100)).to.be.true
      expect(await bridger.isChainAllowed(42161)).to.be.true
      expect(await bridger.isChainAllowed(80001)).to.be.false
    })

    it('sets the requested bridges', async function () {
      expect(await bridger.getTokenBridge(DAI)).to.be.equal(HOP_DAI_BRIDGE)
      expect(await bridger.getTokenBridge(WETH)).to.be.equal(HOP_ETH_BRIDGE)
      expect(await bridger.getTokenBridge(USDC)).to.be.equal(HOP_USDC_BRIDGE)
      expect(await bridger.getTokenBridge(USDT)).to.be.equal(HOP_USDT_BRIDGE)
    })

    it('sets the requested maximums', async function () {
      expect(await bridger.maxDeadline()).to.be.equal(2 * HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.002))
      expect(await bridger.getMaxRelayerFeePct(ZERO_ADDRESS)).to.be.equal(0)
    })
  })
}
