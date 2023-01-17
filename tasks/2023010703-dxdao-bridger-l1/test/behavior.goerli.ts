import { fp, HOUR, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { DxDaoBridgerDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0x98339D8C260052B7ad81c28c16C0b98420f2B46a'
const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const HOP_ETH_BRIDGE = '0xC8A4FB931e8D77df8497790381CA7d228E68a41b'
const HOP_USDC_BRIDGE = '0x7D269D3E0d61A05a0bA976b7DBF8805bF844AF3F'

export function itDeploysDxDaoBridgerCorrectly(): void {
  let input: DxDaoBridgerDeployment
  let smartVault: Contract, bridger: Contract
  let owner: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as DxDaoBridgerDeployment
    ;({ owner, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    bridger = await this.task.deployedInstance('L1HopBridger')
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
            'setSwapConnector',
            'setBridgeConnector',
            'setSwapFee',
            'setBridgeFee',
            'setPerformanceFee',
            'setWithdrawFee',
          ],
        },
        { name: 'mimic', account: feeCollector, roles: ['setFeeCollector'] },
        { name: 'bridger', account: bridger, roles: ['bridge', 'withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
    })

    it('sets a bridge fee', async function () {
      const bridgeFee = await smartVault.bridgeFee()

      expect(bridgeFee.pct).to.be.equal(fp(0.002))
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
        { name: 'mimic', account: feeCollector, roles: ['setPermissiveMode'] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async function () {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async function () {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(0.5))
    })

    it('sets the expected gas limits', async function () {
      expect(await bridger.gasPriceLimit()).to.be.equal(100e9)
      expect(await bridger.totalCostLimit()).to.be.equal(0)
      expect(await bridger.payingGasToken()).to.be.equal(USDC)
    })

    it('allows the requested chain ID', async function () {
      expect(await bridger.destinationChainId()).to.be.equal(80001)
    })

    it('sets the requested bridges', async function () {
      expect(await bridger.getTokenBridge(owner)).to.be.equal(ZERO_ADDRESS)
      expect(await bridger.getTokenBridge(WETH)).to.be.equal(HOP_ETH_BRIDGE)
      expect(await bridger.getTokenBridge(USDC)).to.be.equal(HOP_USDC_BRIDGE)
    })

    it('sets the requested maximums', async function () {
      expect(await bridger.maxDeadline()).to.be.equal(2 * HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.002))
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
}
