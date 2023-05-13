import { toUSDC } from '@mimic-fi/v2-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'

import { assertPermissions } from '../../../src/asserts'
import { MimicFeeCollectorAxelarBridgerDeployment } from '../input'

/* eslint-disable no-secrets/no-secrets */

const USDC = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'

export default function itDeploysMimicFeeCollectorAxelarBridgerCorrectly(): void {
  let input: MimicFeeCollectorAxelarBridgerDeployment
  let smartVault: Contract, manager: Contract, bridger: Contract
  let owner: string, managers: string[]

  before('load accounts', async function () {
    input = this.task.input() as MimicFeeCollectorAxelarBridgerDeployment
    ;({ owner, managers } = input)
  })

  before('load instances', async function () {
    smartVault = await this.task.inputDeployedInstance('SmartVault')
    manager = await this.task.inputDeployedInstance('PermissionsManager')
    bridger = await this.task.deployedInstance('AxelarBridger')
  })

  describe('smart vault', () => {
    it('has set its permissions correctly', async () => {
      await assertPermissions(smartVault, [{ name: 'bridger', account: bridger, roles: ['wrap', 'bridge'] }])
    })
  })

  describe('bridger', () => {
    it('sets its permissions correctly', async () => {
      await assertPermissions(bridger, [
        { name: 'permissions manager', account: manager, roles: ['authorize', 'unauthorize'] },
        { name: 'managers', account: managers, roles: ['call'] },
        { name: 'owner', account: owner, roles: [] },
      ])
    })

    it('has the proper smart vault set', async () => {
      expect(await bridger.smartVault()).to.be.equal(smartVault.address)
    })

    it('sets the expected allowed tokens', async () => {
      expect(await bridger.isTokenAllowed(USDC)).to.be.true
    })

    it('sets the expected allowed chains', async () => {
      expect(await bridger.isChainAllowed(1)).to.be.true
    })

    it('sets the expected threshold', async () => {
      expect(await bridger.thresholdToken()).to.be.equal(USDC)
      expect(await bridger.thresholdAmount()).to.be.equal(toUSDC(10))
    })
  })
}
