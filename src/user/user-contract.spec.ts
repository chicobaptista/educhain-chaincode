/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api'
import { ChaincodeStub, ClientIdentity } from 'fabric-shim'
import { UserContract } from '../index'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import winston = require('winston')

import * as userTxData from '../../transaction_data/user-transactions.json'
import { User } from './user'

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

class TestContext implements Context {
  public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(
    ChaincodeStub
  )
  public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(
    ClientIdentity
  )
  public logger = {
    getLogger: sinon
      .stub()
      .returns(sinon.createStubInstance(winston.createLogger().constructor)),
    setLevel: sinon.stub()
  }
}

describe('UserContract', () => {
  let contract: UserContract
  let ctx: TestContext

  beforeEach(() => {
    contract = new UserContract()
    ctx = new TestContext()
    const user: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    ctx.stub.getState
      .withArgs('b3bb80d9-799e-49e8-ab0f-841ffd8be8bc')
      .resolves(Buffer.from(JSON.stringify(user)))
  })

  describe('#userExists', () => {
    it('should return true for a user', async () => {
      await contract.userExists(ctx, 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc')
        .should.eventually.be.true
    })

    it('should return false for a user that does not exist', async () => {
      await contract.userExists(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.eventually.be.false
    })
  })

  describe('#createUser', () => {
    const user: User = {
      id: '8fc68828-cd82-4554-a4ab-880c2077748c',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    it('should create a user', async () => {
      await contract.createUser(ctx, user)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        '8fc68828-cd82-4554-a4ab-880c2077748c',
        Buffer.from(JSON.stringify(user))
      )
    })

    it('should throw an error for a user that already exists', async () => {
      const newUser = { ...user, id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc' }
      await contract
        .createUser(ctx, newUser)
        .should.be.rejectedWith(
          /The user b3bb80d9-799e-49e8-ab0f-841ffd8be8bc already exists/
        )
    })
  })

  describe('#readUser', () => {
    const user: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    it('should return a user', async () => {
      await contract
        .readUser(ctx, 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc')
        .should.eventually.deep.equal(user)
    })

    it('should throw an error for a user that does not exist', async () => {
      await contract
        .readUser(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.be.rejectedWith(
          /The user 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })

  describe('#updateUser', () => {
    const user: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'Jane Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    it('should update a user', async () => {
      await contract.updateUser(ctx, user)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        user.id,
        Buffer.from(JSON.stringify(user))
      )
    })

    it('should throw an error for a user that does not exist', async () => {
      const newUser = { ...user, id: '8fc68828-cd82-4554-a4ab-880c2077748c' }
      await contract
        .updateUser(ctx, newUser)
        .should.be.rejectedWith(
          /The user 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })

  describe('#deleteUser', () => {
    it('should delete a user', async () => {
      await contract.deleteUser(ctx, 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc')
      ctx.stub.deleteState.should.have.been.calledOnceWithExactly(
        'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc'
      )
    })

    it('should throw an error for a user that does not exist', async () => {
      await contract
        .deleteUser(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.be.rejectedWith(
          /The user 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })
})
