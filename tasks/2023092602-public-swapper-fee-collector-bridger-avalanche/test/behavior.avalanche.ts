import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { PublicSwapperFeeCollectorBridgerAvalancheInstall } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itInstallsPublicSwapperFeeCollectorBridgerAvalancheCorrectly(): void {
  let input: PublicSwapperFeeCollectorBridgerAvalancheInstall
  let smartVault: Contract, manager: Contract, wormholeBridger: Contract

  before('load accounts', async function () {
    input = this.task.input() as PublicSwapperFeeCollectorBridgerAvalancheInstall
  })

  before('load instances', async function () {
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    wormholeBridger = await this.task.deployedInstance('WormholeBridger')
  })

  describe('smart vault', () => {
    it('updates the bridge connector', async function () {
      expect(await smartVault.bridgeConnector()).to.be.equal(input.BridgeConnector)
    })
  })

  describe('wormhole bridger', () => {
    it('has the expected address', async () => {
      expect(wormholeBridger.address).to.be.equal('0x01A5Ebd26489E7E6469a3F781c4365E08A8f5720')
    })

    it('has set its permissions correctly', async () => {
      await assertPermissions(wormholeBridger, [
        { name: 'manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'owner', account: input.owner, roles: ['call'] },
        { name: 'relayer', account: input.relayer, roles: ['call'] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await wormholeBridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the proper destination chain ID', async () => {
      expect(await wormholeBridger.destinationChainId()).to.be.equal(input.wormholeBridger.destinationChainId)
    })

    it('sets the proper max relayer fee pct', async () => {
      expect(await wormholeBridger.maxRelayerFeePct()).to.be.equal(input.wormholeBridger.maxRelayerFeePct)
    })

    it('sets the proper allowed tokens', async () => {
      expect(await wormholeBridger.getAllowedTokens()).to.have.members(input.wormholeBridger.allowedTokens)
    })

    it('sets the expected gas limits', async () => {
      expect(await wormholeBridger.txCostLimit()).to.be.equal(0)
      expect(await wormholeBridger.gasPriceLimit()).to.be.equal(input.wormholeBridger.gasPriceLimit)
    })

    it('sets the expected token threshold params', async () => {
      expect(await wormholeBridger.thresholdToken()).to.be.equal(input.wormholeBridger.thresholdToken)
      expect(await wormholeBridger.thresholdAmount()).to.be.equal(input.wormholeBridger.thresholdAmount)
    })

    it('whitelists the requested relayers', async () => {
      expect(await wormholeBridger.isRelayer(input.relayer)).to.be.true
    })
  })
}
