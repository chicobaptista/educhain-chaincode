/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api'
import { ChaincodeStub, ClientIdentity } from 'fabric-shim'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import winston = require('winston')
import { User } from '../user/user'
import { CertificateContract } from './certificate-contract'
import { Certificate } from './certificate'
import { Course } from '../course/course'

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

describe('CertificateContract', () => {
  let contract: CertificateContract
  let ctx: TestContext

  beforeEach(() => {
    contract = new CertificateContract()
    ctx = new TestContext()
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    const certificate: Certificate = {
      id: '8fc68828-cd82-4554-a4ab-880c2077748c',
      studentId: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      completionDate: new Date(),
      duration: 2,
      courseId: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      instructorId: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc'
    }
    const student: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    ctx.stub.getState
      .withArgs(certificate.id)
      .resolves(Buffer.from(JSON.stringify(certificate)))
  })

  describe('#certificateExists', () => {})
  describe('#readCertificate', () => {})
  describe('#createCertificate', () => {})
})
