import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { DxDaoBridgerDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
const WETH = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'
const WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'

const CHAINLINK_ORACLE_ETH_USD = '0xa767f745331D267c7751297D982b050c93985627'
const CHAINLINK_ORACLE_USDC_USD = '0x26C31ac71010aF62E6B486D1132E266D6298857D'
const CHAINLINK_ORACLE_DAI_USD = '0x678df3415fc31947dA4324eC63212874be5a82f8'

const HOP_DAI_AMM = '0x6C928f435d1F3329bABb42d69CCF043e3900EcF1'
const HOP_USDC_AMM = '0x76b22b8C1079A44F1211D867D68b1eda76a635A7'
const HOP_WETH_AMM = '0x03D7f750777eC48d39D080b020D83Eb2CB4e3547'

export default function itDeploysDxDaoBridgerCorrectly(): void {
  let input: DxDaoBridgerDeployment
  let smartVault: Contract, bridger: Contract, swapper: Contract, withdrawer: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string, mimicAdmin: string

  before('load accounts', async function () {
    input = this.task.input() as DxDaoBridgerDeployment
    ;({ owner, managers, relayers, feeCollector, mimicAdmin } = input.accounts)
  })

  before('load instances', async function () {
    bridger = await this.task.deployedInstance('L2HopBridger')
    swapper = await this.task.deployedInstance('L2HopSwapper')
    withdrawer = await this.task.deployedInstance('Withdrawer')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('smart vault', () => {
    it('has the expected address', async function () {
      expect(smartVault.address).to.be.equal('0x282d45DFe36f08aF75F278dbf5F8c301fB30EA56')
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
            'setSwapConnector',
            'setBridgeConnector',
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['setFeeCollector'] },
        { name: 'swapper', account: swapper, roles: ['swap', 'withdraw'] },
        { name: 'bridger', account: bridger, roles: ['wrap', 'bridge', 'withdraw'] },
        { name: 'withdrawer', account: withdrawer, roles: ['wrap', 'withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('sets a bridge fee', async function () {
      const bridgeFee = await smartVault.bridgeFee()

      expect(bridgeFee.pct).to.be.equal(fp(0.005))
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
      expect(await smartVault.getPriceFeed(WETH, USD)).to.be.equal(CHAINLINK_ORACLE_ETH_USD)
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_ORACLE_USDC_USD)
      expect(await smartVault.getPriceFeed(WXDAI, USD)).to.be.equal(CHAINLINK_ORACLE_DAI_USD)
    })
  })

  describe('swapper', () => {
    it('has set its permissions correctly', async function () {
      await assertPermissions(swapper, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setMaxSlippage',
            'setTokenAmm',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await swapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected gas limits', async function () {
      expect(await swapper.txCostLimit()).to.be.equal(0)
      expect(await swapper.gasPriceLimit()).to.be.equal(40e9)
    })

    it('sets the requested AMMs', async function () {
      expect(await swapper.getTokenAmm(WETH)).to.be.equal(HOP_WETH_AMM)
      expect(await swapper.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
      expect(await swapper.getTokenAmm(WXDAI)).to.be.equal(HOP_DAI_AMM)
    })

    it('sets the requested max slippage', async function () {
      expect(await swapper.maxSlippage()).to.be.equal(fp(0.002))
    })

    it('allows the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await swapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await swapper.isRelayer(manager)).to.be.false
      }
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
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setMaxSlippage',
            'setMaxDeadline',
            'setMaxBonderFeePct',
            'setDestinationChainId',
            'setTokenAmm',
            'transferToSmartVault',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async function () {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(500))
    })

    it('sets the expected gas limits', async function () {
      expect(await bridger.txCostLimit()).to.be.equal(0)
      expect(await bridger.gasPriceLimit()).to.be.equal(40e9)
    })

    it('allows the requested destination chain ID', async function () {
      expect(await bridger.destinationChainId()).to.be.equal(1)
    })

    it('sets the requested AMMs', async function () {
      expect(await bridger.getTokenAmm(WETH)).to.be.equal(HOP_WETH_AMM)
      expect(await bridger.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
      expect(await bridger.getTokenAmm(WXDAI)).to.be.equal(HOP_DAI_AMM)
    })

    it('sets the requested maximums', async function () {
      expect(await bridger.maxDeadline()).to.be.equal(2 * HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.003))
      expect(await bridger.maxBonderFeePct()).to.be.equal(fp(0.03))
    })

    it('allows the requested relayers', async function () {
      for (const relayer of relayers) {
        expect(await bridger.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async function () {
      for (const manager of managers) {
        expect(await bridger.isRelayer(manager)).to.be.false
      }
    })
  })

  describe('withdrawer', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(withdrawer, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'authorize',
            'unauthorize',
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setRecipient',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'swapper', account: swapper, roles: [] },
        { name: 'withdrawer', account: withdrawer, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await withdrawer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the owner as the recipient', async () => {
      expect(await withdrawer.recipient()).to.be.equal(owner)
    })

    it('sets the expected token threshold params', async () => {
      expect(await withdrawer.thresholdToken()).to.be.equal(USDC)
      expect(await withdrawer.thresholdAmount()).to.be.equal(toUSDC(400))
    })

    it('sets the expected gas limits', async () => {
      expect(await withdrawer.txCostLimit()).to.be.equal(0)
      expect(await withdrawer.gasPriceLimit()).to.be.equal(40e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await withdrawer.isRelayer(relayer)).to.be.true
      }
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await withdrawer.isRelayer(manager)).to.be.false
      }
    })
  })
}
