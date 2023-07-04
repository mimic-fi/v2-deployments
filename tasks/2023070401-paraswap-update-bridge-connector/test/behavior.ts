import { expect } from 'chai'
import { Contract } from 'ethers'

import { ParaswapFeeRedistributorUpdateBridgeConnector } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesParaswapFeeRedistributorBridgeConnectorCorrectly(): void {
  let smartVault: Contract

  before('load bridge connector', async function () {
    smartVault = await this.task.inputDeployedInstance('SmartVault')
  })

  it('updates the bridge connector', async function () {
    const { BridgeConnector } = this.task.input() as ParaswapFeeRedistributorUpdateBridgeConnector
    expect(await smartVault.bridgeConnector()).to.be.equal(BridgeConnector)
  })
}
