import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { DxDaoBridgerDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const CHAINLINK_ORACLE_DAI_ETH = '0x773616E4d11A78F511299002da57A0a94577F1f4'
const CHAINLINK_ORACLE_USDC_ETH = '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'

const HOP_ETH_BRIDGE = '0xb8901acB165ed027E32754E0FFe830802919727f'
const HOP_DAI_BRIDGE = '0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1'
const HOP_USDC_BRIDGE = '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a'

export default function itDeploysDxDaoBridgerCorrectly(): void {
  let input: DxDaoBridgerDeployment
  let smartVault: Contract, bridger: Contract, withdrawer: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string, mimicAdmin: string

  before('load accounts', async function () {
    input = this.task.input() as DxDaoBridgerDeployment
    ;({ owner, managers, relayers, feeCollector, mimicAdmin } = input.accounts)
  })

  before('load instances', async function () {
    bridger = await this.task.deployedInstance('L1HopBridger')
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
        { name: 'mimic', account: feeCollector, roles: ['setFeeCollector'] },
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
      expect(await smartVault.getPriceFeed(DAI, WETH)).to.be.equal(CHAINLINK_ORACLE_DAI_ETH)
      expect(await smartVault.getPriceFeed(USDC, WETH)).to.be.equal(CHAINLINK_ORACLE_USDC_ETH)
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
            'setMaxRelayerFeePct',
            'setDestinationChainId',
            'setTokenBridge',
            'withdraw',
            'call',
          ],
        },
        { name: 'mimic', account: mimicAdmin, roles: ['setPermissiveMode'] },
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
      expect(await bridger.gasPriceLimit()).to.be.equal(100e9)
      expect(await bridger.totalCostLimit()).to.be.equal(0)
      expect(await bridger.payingGasToken()).to.be.equal(WETH)
    })

    it('allows the requested chain ID', async function () {
      expect(await bridger.destinationChainId()).to.be.equal(100)
    })

    it('sets the requested bridges', async function () {
      expect(await bridger.getTokenBridge(DAI)).to.be.equal(HOP_DAI_BRIDGE)
      expect(await bridger.getTokenBridge(USDC)).to.be.equal(HOP_USDC_BRIDGE)
      expect(await bridger.getTokenBridge(WETH)).to.be.equal(HOP_ETH_BRIDGE)
    })

    it('sets the requested maximums', async function () {
      expect(await bridger.maxDeadline()).to.be.equal(2 * HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.003))
      expect(await bridger.getMaxRelayerFeePct(ZERO_ADDRESS)).to.be.equal(0)
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
        { name: 'mimic', account: mimicAdmin, roles: ['setPermissiveMode'] },
        { name: 'bridger', account: bridger, roles: [] },
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
      expect(await withdrawer.gasPriceLimit()).to.be.equal(100e9)
      expect(await withdrawer.totalCostLimit()).to.be.equal(0)
      expect(await withdrawer.payingGasToken()).to.be.equal(WETH)
    })

    it('does not allow relayed permissive mode', async () => {
      expect(await withdrawer.isPermissiveModeActive()).to.be.false
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
