import { fp, HOUR, impersonate, toUSDC, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { USD } from '../../../constants/chainlink/denominations'
import { assertPermissions } from '../../../src/asserts'
import { BalancerFeeCollectorL2DeploymentV2 } from '../input'

/* eslint-disable no-secrets/no-secrets */

const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
const USDC = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'

const CHAINLINK_ORACLE_ETH_USD = '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'
const CHAINLINK_ORACLE_USDC_USD = '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3'

const HOP_USDC_AMM = '0xe22D2beDb3Eca35E6397e0C6D62857094aA26F52'

export default function itDeploysBalancerFeeCollectorV2Correctly(): void {
  let input: BalancerFeeCollectorL2DeploymentV2
  let smartVault: Contract, manager: Contract
  let claimer: Contract, bptSwapper: Contract, oneInchSwapper: Contract, paraswapSwapper: Contract, bridger: Contract
  let owner: string, mimic: string, relayers: string[], managers: string[], feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as BalancerFeeCollectorL2DeploymentV2
    ;({ owner, mimic, managers, relayers, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    claimer = await this.task.deployedInstance('Claimer')
    bptSwapper = await this.task.deployedInstance('BPTSwapper')
    oneInchSwapper = await this.task.deployedInstance('OneInchSwapper')
    paraswapSwapper = await this.task.deployedInstance('ParaswapSwapper')
    bridger = await this.task.deployedInstance('L2HopBridger')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('permissions manager', () => {
    it('has the expected address', async function () {
      expect(manager.address).to.be.equal('0x17b198f1bA26Daa9D1fBa35A51B807E091769aF9')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: owner, roles: ['execute'] },
        { name: 'mimic', account: mimic, roles: ['execute'] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('has the expected address', async function () {
      expect(smartVault.address).to.be.equal('0x94Dd9C6152a2A0BBcB52d3297b723A6F01D5F9f7')
    })

    it('uses the correct implementation', async function () {
      const smartVaultsFactory = await this.task.inputDeployedInstance('SmartVaultsFactory')
      const implementation = await smartVaultsFactory.implementationOf(smartVault.address)
      expect(implementation).to.be.equal(input.params.smartVaultParams.impl)
    })

    it('has set its permissions correctly', async function () {
      await assertPermissions(smartVault, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
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
        { name: 'mimic', account: mimic, roles: ['setFeeCollector'] },
        { name: 'claimer', account: claimer, roles: ['call', 'withdraw'] },
        { name: 'bridger', account: bridger, roles: ['bridge', 'withdraw'] },
        { name: '1inch swapper', account: oneInchSwapper, roles: ['swap', 'withdraw'] },
        { name: 'psp swapper', account: paraswapSwapper, roles: ['swap', 'withdraw'] },
        { name: 'managers', account: managers, roles: [] },
        { name: 'relayers', account: relayers, roles: [] },
      ])
    })

    it('sets a fee collector', async function () {
      expect(await smartVault.feeCollector()).to.be.equal(feeCollector)
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
      expect(await smartVault.getPriceFeed(USDC, USD)).to.be.equal(CHAINLINK_ORACLE_USDC_USD)
      expect(await smartVault.getPriceFeed(WETH, USD)).to.be.equal(CHAINLINK_ORACLE_ETH_USD)
    })
  })

  describe('claimer', () => {
    it('has the expected address', async () => {
      expect(claimer.address).to.be.equal('0xdF818E63341767d5F5A9827088f1892e9C604A2D')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(claimer, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setProtocolFeeWithdrawer',
            'setPermissiveRelayedMode',
            'setPayingGasToken',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: 'bpt swapper', account: bptSwapper, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await claimer.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper oracle signer', async () => {
      expect(await claimer.isOracleSigner(relayers[0])).to.be.true
    })

    it('sets the proper paying gas token', async () => {
      expect(await claimer.payingGasToken()).to.be.equal(USDC)
    })

    it('sets the proper protocol fee withdrawer', async () => {
      expect(await claimer.protocolFeeWithdrawer()).to.be.equal('0xdAE7e32ADc5d490a43cCba1f0c736033F2b4eFca')
    })

    it('sets the expected token threshold params', async () => {
      expect(await claimer.thresholdToken()).to.be.equal(USDC)
      expect(await claimer.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected limits', async () => {
      expect(await claimer.txCostLimit()).to.be.equal(0)
      expect(await claimer.gasPriceLimit()).to.be.equal(5e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await claimer.isRelayer(relayer)).to.be.true
      }
    })

    it('enables the relayed permissive mode', async () => {
      expect(await claimer.isPermissiveRelayedModeActive()).to.be.true
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await claimer.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize claimer methods', async () => {
      const who = mimic
      const what = claimer.interface.getSighash('call')
      expect(await claimer.isAuthorized(who, what)).to.be.false

      const requests = [{ target: claimer.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await claimer.isAuthorized(who, what)).to.be.true
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
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setPermissiveRelayedMode',
            'setRelayer',
            'setThreshold',
            'setOracleSigner',
            'setPayingGasToken',
            'setPermissiveRelayedMode',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: 'bpt swapper', account: bptSwapper, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bptSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper oracle signer', async () => {
      expect(await bptSwapper.isOracleSigner(relayers[0])).to.be.true
    })

    it('sets the proper paying gas token', async () => {
      expect(await bptSwapper.payingGasToken()).to.be.equal(USDC)
    })

    it('sets the expected token threshold params', async () => {
      expect(await bptSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await bptSwapper.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected limits', async () => {
      expect(await bptSwapper.gasPriceLimit()).to.be.equal(5e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await bptSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('enables the relayed permissive mode', async () => {
      expect(await bptSwapper.isPermissiveRelayedModeActive()).to.be.true
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await bptSwapper.isRelayer(manager)).to.be.false
      }
    })
  })

  describe('1inch swapper', () => {
    it('has the expected address', async () => {
      expect(oneInchSwapper.address).to.be.equal('0xd712A863766dE7e7cA13289A97997E01832A6571')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(oneInchSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setTokenOut',
            'setSwapSigner',
            'setPermissiveRelayedMode',
            'setDefaultMaxSlippage',
            'setTokenMaxSlippage',
            'setDeniedTokens',
            'setThreshold',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await oneInchSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected signer', async () => {
      expect(await oneInchSwapper.swapSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
    })

    it('sets the expected slippages', async () => {
      expect(await oneInchSwapper.defaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await oneInchSwapper.getTokenSlippage(USDC)).to.be.equal(fp(0.002))
    })

    it('sets the expected denied tokens', async () => {
      expect(await oneInchSwapper.getDeniedTokens()).to.be.empty
    })

    it('sets the expected token threshold params', async () => {
      expect(await oneInchSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await oneInchSwapper.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await oneInchSwapper.txCostLimit()).to.be.equal(0)
      expect(await oneInchSwapper.gasPriceLimit()).to.be.equal(5e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await oneInchSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not enable the relayed permissive mode', async () => {
      expect(await oneInchSwapper.isPermissiveRelayedModeActive()).to.be.false
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await oneInchSwapper.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize 1inch swapper methods', async () => {
      const who = mimic
      const what = oneInchSwapper.interface.getSighash('call')
      expect(await oneInchSwapper.isAuthorized(who, what)).to.be.false

      const requests = [{ target: oneInchSwapper.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await oneInchSwapper.isAuthorized(who, what)).to.be.true
    })
  })

  describe('paraswap swapper', () => {
    it('has the expected address', async () => {
      expect(paraswapSwapper.address).to.be.equal('0x95676AaEcD59B19C5B79008F86d3A291628b0947')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(paraswapSwapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setTokenOut',
            'setSwapSigner',
            'setPermissiveRelayedMode',
            'setDefaultMaxSlippage',
            'setTokenMaxSlippage',
            'setDeniedTokens',
            'setThreshold',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await paraswapSwapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected signer', async () => {
      expect(await paraswapSwapper.swapSigner()).to.be.equal('0x6278c27CF5534F07fA8f1Ab6188a155cb8750FFA')
    })

    it('sets the expected slippages', async () => {
      expect(await paraswapSwapper.defaultMaxSlippage()).to.be.equal(fp(0.002))
      expect(await paraswapSwapper.getTokenSlippage(USDC)).to.be.equal(fp(0.002))
    })

    it('sets the expected denied tokens', async () => {
      expect(await oneInchSwapper.getDeniedTokens()).to.be.empty
    })

    it('sets the expected token threshold params', async () => {
      expect(await paraswapSwapper.thresholdToken()).to.be.equal(USDC)
      expect(await paraswapSwapper.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await paraswapSwapper.txCostLimit()).to.be.equal(0)
      expect(await paraswapSwapper.gasPriceLimit()).to.be.equal(5e9)
    })

    it('whitelists the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await paraswapSwapper.isRelayer(relayer)).to.be.true
      }
    })

    it('does not enable the relayed permissive mode', async () => {
      expect(await paraswapSwapper.isPermissiveRelayedModeActive()).to.be.false
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await paraswapSwapper.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize paraswap swapper methods', async () => {
      const who = mimic
      const what = paraswapSwapper.interface.getSighash('call')
      expect(await paraswapSwapper.isAuthorized(who, what)).to.be.false

      const requests = [{ target: paraswapSwapper.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await paraswapSwapper.isAuthorized(who, what)).to.be.true
    })
  })

  describe('bridger', () => {
    it('has the expected address', async () => {
      expect(bridger.address).to.be.equal('0xd59067776240b2F19Cd1D4ccc4AD2471D57b223F')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(bridger, [
        {
          name: 'owner',
          account: owner,
          roles: [
            'setSmartVault',
            'setLimits',
            'setRelayer',
            'setThreshold',
            'setMaxSlippage',
            'setMaxDeadline',
            'setMaxBonderFeePct',
            'setDestinationChainId',
            'setTokenAmm',
            'setPermissiveRelayedMode',
            'transferToSmartVault',
            'call',
          ],
        },
        { name: 'mimic', account: mimic, roles: [] },
        { name: 'claimer', account: claimer, roles: [] },
        { name: 'bridger', account: bridger, roles: [] },
        { name: '1inch swapper', account: oneInchSwapper, roles: [] },
        { name: 'psp swapper', account: paraswapSwapper, roles: [] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'relayers', account: relayers, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected token threshold params', async () => {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(1))
    })

    it('sets the expected gas limits', async () => {
      expect(await bridger.txCostLimit()).to.be.equal(0)
      expect(await bridger.gasPriceLimit()).to.be.equal(5e9)
    })

    it('allows the requested destination chain ID', async () => {
      expect(await bridger.destinationChainId()).to.be.equal(1)
    })

    it('sets the requested AMMs', async () => {
      expect(await bridger.getTokenAmm(USDC)).to.be.equal(HOP_USDC_AMM)
    })

    it('sets the requested maximums', async () => {
      expect(await bridger.maxDeadline()).to.be.equal(HOUR)
      expect(await bridger.maxSlippage()).to.be.equal(fp(0.002))
      expect(await bridger.maxBonderFeePct()).to.be.equal(fp(0.5))
    })

    it('allows the requested relayers', async () => {
      for (const relayer of relayers) {
        expect(await bridger.isRelayer(relayer)).to.be.true
      }
    })

    it('does not enable the relayed permissive mode', async () => {
      expect(await bridger.isPermissiveRelayedModeActive()).to.be.false
    })

    it('does not whitelist managers as relayers', async () => {
      for (const manager of managers) {
        expect(await bridger.isRelayer(manager)).to.be.false
      }
    })

    it('can authorize bridger methods', async () => {
      const who = mimic
      const what = bridger.interface.getSighash('call')
      expect(await bridger.isAuthorized(who, what)).to.be.false

      const requests = [{ target: bridger.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(owner, fp(10))).execute(requests)

      expect(await bridger.isAuthorized(who, what)).to.be.true
    })
  })
}
