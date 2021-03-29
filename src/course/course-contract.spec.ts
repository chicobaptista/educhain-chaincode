/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api'
import { ChaincodeStub, ClientIdentity } from 'fabric-shim'
import { CourseContract } from '../index'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import winston = require('winston')
import { Course } from './course'
import moment = require('moment')
import { User } from '../user/user'
import { CertificateContract } from '../certificate/certificate-contract'
import { Certificate } from '../certificate/certificate'

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

describe('CourseContract', () => {
  let contract: CourseContract
  let ctx: TestContext

  beforeEach(() => {
    contract = new CourseContract()
    ctx = new TestContext()
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    const instructor: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    ctx.stub.getState
      .withArgs(course.id)
      .resolves(Buffer.from(JSON.stringify(course)))
    ctx.stub.getState
      .withArgs(course.instructor)
      .resolves(Buffer.from(JSON.stringify(instructor)))
  })

  describe('#courseExists', () => {
    it('should return true for a course', async () => {
      await contract.courseExists(ctx, 'f47d68f7-0883-4989-9757-39b32e5389ac')
        .should.eventually.be.true
    })

    it('should return false for a course that does not exist', async () => {
      await contract.courseExists(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.eventually.be.false
    })
  })

  describe('#createCourse', () => {
    const course: Course = {
      id: '8fc68828-cd82-4554-a4ab-880c2077748c',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    it('should create a course', async () => {
      await contract.createCourse(ctx, course)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        course.id,
        Buffer.from(JSON.stringify(course))
      )
    })

    it('should throw an error for an instructor that does not exist', async () => {
      const newCourse = {
        ...course,
        instructor: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .createCourse(ctx, newCourse)
        .should.be.rejectedWith(
          /The user 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })

    it('should throw an error for a course that already exists', async () => {
      const newCourse = {
        ...course,
        id: 'f47d68f7-0883-4989-9757-39b32e5389ac'
      }
      await contract
        .createCourse(ctx, newCourse)
        .should.be.rejectedWith(
          /The course f47d68f7-0883-4989-9757-39b32e5389ac already exists/
        )
    })
  })

  describe('#readCourse', () => {
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    it('should return a course', async () => {
      await contract
        .readCourse(ctx, course.id)
        .should.eventually.deep.equal(course)
    })

    it('should throw an error for a course that does not exist', async () => {
      await contract
        .readCourse(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.be.rejectedWith(
          /The course 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })

  describe('#updateCourse', () => {
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    it('should update a course', async () => {
      await contract.updateCourse(ctx, course)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        course.id,
        Buffer.from(JSON.stringify(course))
      )
    })

    it('should throw an error for a course that does not exist', async () => {
      const newCourse = {
        ...course,
        id: '8fc68828-cd82-4554-a4ab-880c2077748c'
      }
      await contract
        .updateCourse(ctx, newCourse)
        .should.be.rejectedWith(
          /The course 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })

  describe('#enrollStudent', () => {
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: []
    }
    const student: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    it('should add a student to the course', async () => {
      const courseWithStudent = {
        ...course,
        students: [student.id]
      }
      await contract.enrollStudent(ctx, course.id, student.id)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        course.id,
        Buffer.from(JSON.stringify(courseWithStudent))
      )
    })
    it('should throw an error for a course that does not exist', async () => {
      const invalidCourse = {
        ...course,
        id: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .enrollStudent(ctx, invalidCourse.id, student.id)
        .should.be.rejectedWith(
          /The course 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })

    it('should throw an error for a student that does not exist', async () => {
      const invalidStudent = {
        ...student,
        id: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .enrollStudent(ctx, course.id, invalidStudent.id)
        .should.be.rejectedWith(
          /The user 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })
    it('should throw an error for a student that is already enrolled', async () => {
      const newCourse: Course = {
        ...course,
        students: ['b3bb80d9-799e-49e8-ab0f-841ffd8be8bc']
      }

      ctx.stub.getState
        .withArgs(newCourse.id)
        .resolves(Buffer.from(JSON.stringify(newCourse)))

      await contract
        .enrollStudent(ctx, newCourse.id, student.id)
        .should.be.rejectedWith(
          /The user b3bb80d9-799e-49e8-ab0f-841ffd8be8bc is already enrolled/
        )
    })
  })

  describe('#disenrollStudent', () => {
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: ['b3bb80d9-799e-49e8-ab0f-841ffd8be8bc']
    }
    const student: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }

    it('should remove a student from the course', async () => {
      const courseWithoutStudent: Course = {
        ...course,
        students: []
      }
      ctx.stub.getState
        .withArgs(course.id)
        .resolves(Buffer.from(JSON.stringify(course)))
      await contract.disenrollStudent(ctx, course.id, student.id)
      ctx.stub.putState.should.have.been.calledOnceWithExactly(
        course.id,
        Buffer.from(JSON.stringify(courseWithoutStudent))
      )
    })
    it('should throw an error for a course that does not exist', async () => {
      const invalidCourse = {
        ...course,
        id: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .disenrollStudent(ctx, invalidCourse.id, student.id)
        .should.be.rejectedWith(
          /The course 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })
    it('should throw an error for a student that is not enrolled', async () => {
      ctx.stub.getState
        .withArgs(course.id)
        .resolves(Buffer.from(JSON.stringify(course)))
      const invalidStudent = {
        ...student,
        id: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .disenrollStudent(ctx, course.id, invalidStudent.id)
        .should.be.rejectedWith(
          /The user 4609d932-32d0-4681-a762-17524514939b is not enrolled in the course f47d68f7-0883-4989-9757-39b32e5389ac/
        )
    })
    it('should throw an error for a course that has no students enrolled', async () => {
      const courseWithoutStudent: Course = {
        ...course,
        students: []
      }
      ctx.stub.getState
        .withArgs(courseWithoutStudent.id)
        .resolves(Buffer.from(JSON.stringify(courseWithoutStudent)))

      await contract
        .disenrollStudent(ctx, courseWithoutStudent.id, student.id)
        .should.be.rejectedWith(
          /The user b3bb80d9-799e-49e8-ab0f-841ffd8be8bc is not enrolled in the course f47d68f7-0883-4989-9757-39b32e5389ac/
        )
    })
  })

  describe('#deleteCourse', () => {
    it('should delete a course', async () => {
      await contract.deleteCourse(ctx, 'f47d68f7-0883-4989-9757-39b32e5389ac')
      ctx.stub.deleteState.should.have.been.calledOnceWithExactly(
        'f47d68f7-0883-4989-9757-39b32e5389ac'
      )
    })

    it('should throw an error for a course that does not exist', async () => {
      await contract
        .deleteCourse(ctx, '8fc68828-cd82-4554-a4ab-880c2077748c')
        .should.be.rejectedWith(
          /The course 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })
  })

  describe('#emitCertificate', () => {
    const course: Course = {
      id: 'f47d68f7-0883-4989-9757-39b32e5389ac',
      name: 'My Course',
      duration: 2,
      instructor: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      students: ['b3bb80d9-799e-49e8-ab0f-841ffd8be8bc']
    }
    const student: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }
    const instructor: User = {
      id: 'b3bb80d9-799e-49e8-ab0f-841ffd8be8bc',
      name: 'John Doe',
      email: 'john.doe@email.com',
      certificates: [],
      publicKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJS+Q2rOf/itOXOfk2CA/tq7nIgKN197HafHsd3BShCzqPRkqCYuoZvPzMyyOnJNQWz2w6HeUrZCAGE6xKa1jqECAwEAAQ=='
    }

    it('should emit a certificate', async () => {
      ctx.stub.getState
        .withArgs(course.id)
        .resolves(Buffer.from(JSON.stringify(course)))

      const certificateId = await contract.emitCertificate(
        ctx,
        course.id,
        student.id
      )

      const studentWithCertificate: User = {
        ...student,
        certificates: [certificateId]
      }
      ctx.stub.putState.should.have.been.calledWith(
        student.id,
        Buffer.from(JSON.stringify(studentWithCertificate))
      )
    })

    it('should throw an error for a course that does not exist', async () => {
      await contract
        .emitCertificate(
          ctx,
          '8fc68828-cd82-4554-a4ab-880c2077748c',
          student.id
        )
        .should.be.rejectedWith(
          /The course 8fc68828-cd82-4554-a4ab-880c2077748c does not exist/
        )
    })

    it('should throw an error for a student that does not exist', async () => {
      const invalidStudent = {
        ...student,
        id: '4609d932-32d0-4681-a762-17524514939b'
      }
      await contract
        .emitCertificate(ctx, course.id, invalidStudent.id)
        .should.be.rejectedWith(
          /The user 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })

    it('should throw an error for an instructor that does not exist', async () => {
      const newCourse = {
        ...course,
        instructor: '4609d932-32d0-4681-a762-17524514939b'
      }
      ctx.stub.getState
        .withArgs(course.id)
        .resolves(Buffer.from(JSON.stringify(newCourse)))
      await contract
        .emitCertificate(ctx, course.id, student.id)
        .should.be.rejectedWith(
          /The instructor 4609d932-32d0-4681-a762-17524514939b does not exist/
        )
    })

    it('should throw an error for a student that is not enrolled', async () => {
      const newCourse: Course = {
        ...course,
        students: ['4609d932-32d0-4681-a762-17524514939b']
      }
      ctx.stub.getState
        .withArgs(course.id)
        .resolves(Buffer.from(JSON.stringify(newCourse)))
      await contract
        .emitCertificate(ctx, course.id, student.id)
        .should.be.rejectedWith(
          /The user b3bb80d9-799e-49e8-ab0f-841ffd8be8bc is not enrolled in the course f47d68f7-0883-4989-9757-39b32e5389ac/
        )
    })
  })
})
