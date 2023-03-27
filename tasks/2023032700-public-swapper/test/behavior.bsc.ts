import { fp, impersonate, ZERO_ADDRESS } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { PublicSwapperDeployment } from '../input'

export default function itDeploysPublicSwapperCorrectly(): void {
  let input: PublicSwapperDeployment
  let smartVault: Contract, manager: Contract, swapper: Contract, mimic: string, feeCollector: string

  before('load accounts', async function () {
    input = this.task.input() as PublicSwapperDeployment
    ;({ mimic, feeCollector } = input.accounts)
  })

  before('load instances', async function () {
    manager = await this.task.deployedInstance('PermissionsManager')
    swapper = await this.task.deployedInstance('Swapper')
    smartVault = await this.task.deployedInstance('SmartVault')
  })

  describe('permissions manager', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(manager, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'mimic', account: mimic, roles: ['execute'] },
        { name: 'swapper', account: swapper, roles: [] },
      ])
    })
  })

  describe('smart vault', () => {
    it('has the expected address', async function () {
      expect(smartVault.address).to.be.equal('0xa7Ca2C8673bcFA5a26d8ceeC2887f2CC2b0Db22A')
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
          name: 'mimic',
          account: mimic,
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
            'setFeeCollector',
          ],
        },
        { name: 'swapper', account: swapper, roles: ['collect', 'swap', 'wrap', 'unwrap', 'withdraw'] },
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

    it('sets a swap fee', async function () {
      const swapFee = await smartVault.swapFee()

      expect(swapFee.pct).to.be.equal(fp(0.007))
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

    it('sets no bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(ZERO_ADDRESS)
    })
  })

  describe('swapper', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(swapper, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'mimic', account: mimic, roles: ['setSmartVault', 'setSource', 'pause', 'unpause'] },
        { name: 'swapper', account: swapper, roles: [] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await swapper.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected sources', async () => {
      expect(await swapper.isSourceAllowed(3)).to.be.true
      expect(await swapper.isSourceAllowed(4)).to.be.true

      const sources = await swapper.getAllowedSources()
      expect(sources).to.have.lengthOf(2)
      expect(sources[0]).to.be.equal(3)
      expect(sources[1]).to.be.equal(4)
    })

    it('can authorize swapper methods', async () => {
      const who = feeCollector
      const what = swapper.interface.getSighash('pause')
      expect(await swapper.isAuthorized(who, what)).to.be.false

      const requests = [{ target: swapper.address, changes: [{ grant: true, permission: { who, what } }] }]
      await manager.connect(await impersonate(mimic, fp(10))).execute(requests)

      expect(await swapper.isAuthorized(who, what)).to.be.true
    })
  })
}
