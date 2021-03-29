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
import { CertificateContract } from '../index'
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
      completionDate: new Date('1995-12-17T03:24:00'),
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
    ctx.stub.getState
      .withArgs(student.id)
      .resolves(Buffer.from(JSON.stringify(student)))
    ctx.stub.getState
      .withArgs(course.id)
      .resolves(Buffer.from(JSON.stringify(course)))
  })

  describe('#certificateExists', () => {
    it('should return true for a certificate', async () => {
      await contract.certificateExists(
        ctx,
        '8fc68828-cd82-4554-a4ab-880c2077748c'
      ).should.eventually.be.true
    })

    it('should return false for a certificate that does not exist', async () => {
      await contract.certificateExists(
        ctx,
        'd9ff5a21-3f82-4c97-bf82-1037f33fba78'
      ).should.eventually.be.false
    })
  })
  describe('#createCertificate', () => {
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
    it('should create a certificate', async () => {
      const newCertificate = {
        ...certificate,
        id: 'fdfb7a6f-6d6f-459c-b968-8c89d6afbb74'
      }
      await contract.createCertificate(ctx, newCertificate)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        newCertificate.id,
        Buffer.from(JSON.stringify(newCertificate))
      )
    })
    it('should throw an error for a certificate that already exists', async () => {
      await contract
        .createCertificate(ctx, certificate)
        .should.be.rejectedWith(
          /The certificate 8fc68828-cd82-4554-a4ab-880c2077748c already exists/
        )
    })
    it('should throw an error for a course that does not exist', async () => {
      const newCertificate: Certificate = {
        ...certificate,
        id: 'fdfb7a6f-6d6f-459c-b968-8c89d6afbb74',
        courseId: 'cf29911a-8183-4866-8270-6dd4d422e894'
      }
      await contract
        .createCertificate(ctx, newCertificate)
        .should.be.rejectedWith(
          /The course cf29911a-8183-4866-8270-6dd4d422e894 does not exist/
        )
    })

    it('should throw an error for an instructor that does not exist', async () => {
      const newCertificate: Certificate = {
        ...certificate,
        id: 'fdfb7a6f-6d6f-459c-b968-8c89d6afbb74',
        instructorId: 'cf29911a-8183-4866-8270-6dd4d422e894'
      }
      await contract
        .createCertificate(ctx, newCertificate)
        .should.be.rejectedWith(
          /The user cf29911a-8183-4866-8270-6dd4d422e894 does not exist/
        )
    })
    it('should throw an error for a student that does not exist', async () => {
      const newCertificate: Certificate = {
        ...certificate,
        id: 'fdfb7a6f-6d6f-459c-b968-8c89d6afbb74',
        studentId: 'cf29911a-8183-4866-8270-6dd4d422e894'
      }
      await contract
        .createCertificate(ctx, newCertificate)
        .should.be.rejectedWith(
          /The user cf29911a-8183-4866-8270-6dd4d422e894 does not exist/
        )
    })
  })
  describe('#readCertificate', () => {
    const certificate: Certificate = {
      id: '8fc68828-cd82-4554-a4ab-880c2077748c',
      studentId: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      completionDate: new Date('1995-12-17T03:24:00'),
      duration: 2,
      courseId: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      instructorId: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc'
    }
    it('should return a certificate', async () => {
      await contract
        .readCertificate(ctx, certificate.id)
        .should.eventually.deep.equal(JSON.parse(JSON.stringify(certificate)))
    })

    it('should throw an error for a course that does not exist', async () => {
      await contract
        .readCertificate(ctx, 'cf29911a-8183-4866-8270-6dd4d422e894')
        .should.be.rejectedWith(
          /The certificate cf29911a-8183-4866-8270-6dd4d422e894 does not exist/
        )
    })
  })
})
