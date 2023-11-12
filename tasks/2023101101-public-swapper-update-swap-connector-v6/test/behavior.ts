import { expect } from 'chai'
import { Contract } from 'ethers'

import { PublicSwapperUpdateSwapConnector } from '../input'

/* eslint-disable no-secrets/no-secrets */

export default function itUpdatesPublicSwapperSwapConnectorCorrectly(): void {
  let smartVault: Contract

  before('load swap connector', async function () {
    smartVault = await this.task.inputDeployedInstance('SmartVault')
  })

  it('updates the swap connector', async function () {
    const { SwapConnector } = this.task.input() as PublicSwapperUpdateSwapConnector
    expect(await smartVault.swapConnector()).to.be.equal(SwapConnector)
  })
}
