import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { PublicSwapperFeeCollectorBridgerBnbInstall } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itInstallsPublicSwapperFeeCollectorBridgerBnbCorrectly(): void {
  let input: PublicSwapperFeeCollectorBridgerBnbInstall
  let smartVault: Contract, manager: Contract, connextBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as PublicSwapperFeeCollectorBridgerBnbInstall
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    connextBridger = await this.task.deployedInstance('ConnextBridger')
  })

  describe('smart vault', () => {
    it('updates the bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.BridgeConnector)
    })
  })

  describe('connext bridger', () => {
    it('has the expected address', async () => {
      expect(connextBridger.address).to.be.equal('0x8f556010a5B0B1418cD72BcF312bB25efD1F4D0c')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(connextBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await connextBridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper destination chain ID', async () => {
      expect(await connextBridger.destinationChainId()).to.be.equal(input.connextBridger.destinationChainId)
    })

    it('sets the proper allowed tokens', async () => {
      expect(await connextBridger.getAllowedTokens()).to.have.members(input.connextBridger.allowedTokens)
    })

    it('sets the proper max slippage', async () => {
      expect(await connextBridger.maxSlippage()).to.be.equal(input.connextBridger.maxSlippage)
    })

    it('sets the proper max relayer fee pct', async () => {
      expect(await connextBridger.maxRelayerFeePct()).to.be.equal(input.connextBridger.maxRelayerFeePct)
    })

    it('sets the expected gas limits', async () => {
      expect(await connextBridger.txCostLimit()).to.be.equal(0)
      expect(await connextBridger.gasPriceLimit()).to.be.equal(input.connextBridger.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await connextBridger.thresholdToken()).to.be.equal(input.connextBridger.thresholdToken)
      expect(await connextBridger.thresholdAmount()).to.be.equal(input.connextBridger.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await connextBridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
