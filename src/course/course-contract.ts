/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction
} from 'fabric-contract-api'
import { CertificatePersistence } from '../certificate/certificate-persistence'
import { UserPersistence } from '../user/user-persistence'
import { UserContract } from '../index'
import { CoursePersistence } from './course-persistence'
import { v4 as uuidv4 } from 'uuid'
import { CertificateContract } from '../index'
import { CourseModel } from './course-model'
import { UserModel } from '../user/user-model'
import { CertificateModel } from '../certificate/certificate-model'

@Info({ title: 'CourseContract', description: 'My Smart Contract' })
export class CourseContract extends Contract {
  userContract = new UserContract()
  certificateContract = new CertificateContract()

  @Transaction(false)
  @Returns('boolean')
  public async courseExists(ctx: Context, courseId: string): Promise<boolean> {
    const data: Uint8Array = await ctx.stub.getState(courseId)
    return !!data && data.length > 0
  }

  @Transaction(true)
  public async createCourse(
    ctx: Context,
    course: CourseModel
  ): Promise<string> {
    const exists: boolean = await this.courseExists(ctx, course.id)
    if (exists) {
      throw new Error(`The course ${course.id} already exists`)
    }
    const instructorExists = await this.userContract.userExists(
      ctx,
      course.instructor
    )
    if (!instructorExists) {
      throw new Error(`The user ${course.instructor} does not exist`)
    }
    const savedId = await this.saveCourse(ctx, course)
    return savedId
  }

  @Transaction(false)
  @Returns('User')
  public async readCourse(
    ctx: Context,
    courseId: string
  ): Promise<CourseModel> {
    const exists: boolean = await this.courseExists(ctx, courseId)
    if (!exists) {
      throw new Error(`The course ${courseId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(courseId)
    const pCourse: CoursePersistence = JSON.parse(data.toString())
    const course = CourseModel.mapFromPersistence(pCourse)
    return course
  }

  @Transaction(true)
  public async updateCourse(
    ctx: Context,
    course: CourseModel
  ): Promise<string> {
    const exists: boolean = await this.courseExists(ctx, course.id)
    if (!exists) {
      throw new Error(`The course ${course.id} does not exist`)
    }
    const existingCourse: CourseModel = await this.readCourse(ctx, course.id)
    const newCourse = { ...existingCourse, ...course }
    const savedId = await this.saveCourse(ctx, newCourse)
    return savedId
  }

  @Transaction(true)
  public async deleteCourse(ctx: Context, courseId: string): Promise<string> {
    const exists: boolean = await this.courseExists(ctx, courseId)
    if (!exists) {
      throw new Error(`The course ${courseId} does not exist`)
    }
    await ctx.stub.deleteState(courseId)
    return courseId
  }

  @Transaction(true)
  public async enrollStudent(
    ctx: Context,
    courseId: string,
    studentId: string
  ): Promise<string> {
    const courseExists: boolean = await this.courseExists(ctx, courseId)
    if (!courseExists) {
      throw new Error(`The course ${courseId} does not exist`)
    }

    const studentExists: boolean = await this.userContract.userExists(
      ctx,
      studentId
    )
    if (!studentExists) {
      throw new Error(`The user ${studentId} does not exist`)
    }

    const existingCourse: CourseModel = await this.readCourse(ctx, courseId)
    const hasStudents: boolean = existingCourse.students.length >= 0
    const studentIsEnrolled: boolean =
      hasStudents &&
      (await existingCourse.students.find((stdId) => stdId === studentId))
    if (studentIsEnrolled) {
      throw new Error(`The user ${studentId} is already enrolled`)
    }

    existingCourse.students.push(studentId)
    const savedId = this.saveCourse(ctx, existingCourse)
    return savedId
  }

  @Transaction(true)
  public async disenrollStudent(
    ctx: Context,
    courseId: string,
    studentId: string
  ): Promise<string> {
    const courseExists: boolean = await this.courseExists(ctx, courseId)
    if (!courseExists) {
      throw new Error(`The course ${courseId} does not exist`)
    }

    const existingCourse: CourseModel = await this.readCourse(ctx, courseId)
    const studentIndex: number = await existingCourse.students.find(
      (stdId) => stdId === studentId
    )
    if (!studentIndex) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }
    existingCourse.students.splice(studentIndex, 1)
    const savedId = this.saveCourse(ctx, existingCourse)
    return savedId
  }

  @Transaction(true)
  public async emitCertificate(
    ctx: Context,
    courseId: string,
    studentId: string
  ): Promise<string> {
    const exists: boolean = await this.courseExists(ctx, courseId)
    if (!exists) {
      throw new Error(`The course ${courseId} does not exist`)
    }
    const existingCourse: CourseModel = await this.readCourse(ctx, courseId)

    const instructorExists: boolean = await this.userContract.userExists(
      ctx,
      existingCourse.instructor
    )
    if (!instructorExists) {
      throw new Error(
        `The instructor ${existingCourse.instructor} does not exist`
      )
    }

    const studentExists: boolean = await this.userContract.userExists(
      ctx,
      studentId
    )
    if (!studentExists) {
      throw new Error(`The user ${studentId} does not exist`)
    }

    const existingStudent: UserModel = await this.userContract.readUser(
      ctx,
      studentId
    )

    const studentIndex: number = await existingCourse.students.find(
      (stdId) => stdId === studentId
    )
    if (!studentIndex) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }
    try {
      const certificate: CertificateModel = {
        id: uuidv4(),
        studentId,
        completionDate: new Date(),
        duration: existingCourse.duration,
        courseId: existingCourse.id,
        instructorId: existingCourse.instructor
      }
      await this.certificateContract.createCertificate(ctx, certificate)
      existingStudent.certificates.push(certificate.id)
      await this.userContract.updateUser(ctx, existingStudent)
      return certificate.id
    } catch (error) {
      throw new Error(`Error emmiting certificate`)
    }
  }

  async saveCourse(ctx: Context, course: CourseModel): Promise<string> {
    const pCourse: CoursePersistence = CourseModel.mapToPersistence(course)
    const buffer: Buffer = Buffer.from(JSON.stringify(pCourse))
    await ctx.stub.putState(course.id, buffer)
    return course.id
  }
}
