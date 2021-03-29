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
import { Certificate } from '../certificate/certificate'
import { User } from '../user/user'
import { UserContract } from '../index'
import { Course } from './course'
import { v4 as uuidv4 } from 'uuid'
import { CertificateContract } from '../index'

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
  public async createCourse(ctx: Context, course: Course): Promise<void> {
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

    const buffer: Buffer = Buffer.from(JSON.stringify(course))
    await ctx.stub.putState(course.id, buffer)
  }

  @Transaction(false)
  @Returns('User')
  public async readCourse(ctx: Context, courseId: string): Promise<Course> {
    const exists: boolean = await this.courseExists(ctx, courseId)
    if (!exists) {
      throw new Error(`The course ${courseId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(courseId)
    const student: Course = JSON.parse(data.toString()) as Course
    return student
  }

  @Transaction(true)
  public async updateCourse(ctx: Context, course: Course): Promise<void> {
    const exists: boolean = await this.courseExists(ctx, course.id)
    if (!exists) {
      throw new Error(`The course ${course.id} does not exist`)
    }
    const existingCourse: Course = await this.readCourse(ctx, course.id)
    const newCourse = { ...existingCourse, ...course }
    const buffer: Buffer = Buffer.from(JSON.stringify(newCourse))
    await ctx.stub.putState(course.id, buffer)
  }

  @Transaction(true)
  public async deleteCourse(ctx: Context, courseId: string): Promise<void> {
    const exists: boolean = await this.courseExists(ctx, courseId)
    if (!exists) {
      throw new Error(`The course ${courseId} does not exist`)
    }
    await ctx.stub.deleteState(courseId)
  }

  @Transaction(true)
  public async enrollStudent(
    ctx: Context,
    courseId: string,
    studentId: string
  ): Promise<void> {
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

    const existingCourse: Course = await this.readCourse(ctx, courseId)
    const hasStudents: boolean = existingCourse.students.length >= 0
    const studentIsEnrolled: boolean =
      hasStudents &&
      (await existingCourse.students.find((stdId) => stdId === studentId))
    if (studentIsEnrolled) {
      throw new Error(`The user ${studentId} is already enrolled`)
    }

    if (!hasStudents) {
      existingCourse.students = [studentId]
    } else {
      existingCourse.students.push(studentId)
    }
    const buffer: Buffer = Buffer.from(JSON.stringify(existingCourse))
    await ctx.stub.putState(courseId, buffer)
  }

  @Transaction(true)
  public async disenrollStudent(
    ctx: Context,
    courseId: string,
    studentId: string
  ): Promise<void> {
    const courseExists: boolean = await this.courseExists(ctx, courseId)
    if (!courseExists) {
      throw new Error(`The course ${courseId} does not exist`)
    }

    const existingCourse: Course = await this.readCourse(ctx, courseId)
    const hasStudents: boolean = existingCourse.students.length >= 0
    if (!hasStudents) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }
    const studentIndex: number = await existingCourse.students.find(
      (stdId) => stdId === studentId
    )
    if (!studentIndex) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }
    existingCourse.students.splice(studentIndex, 1)
    const buffer: Buffer = Buffer.from(JSON.stringify(existingCourse))
    await ctx.stub.putState(courseId, buffer)
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
    const existingCourse: Course = await this.readCourse(ctx, courseId)

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

    const existingStudent: User = await this.userContract.readUser(
      ctx,
      studentId
    )

    const hasStudents: boolean = existingCourse.students.length >= 0
    if (!hasStudents) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }

    const studentIndex: number = await existingCourse.students.find(
      (stdId) => stdId === studentId
    )
    if (!studentIndex) {
      throw new Error(
        `The user ${studentId} is not enrolled in the course ${courseId}`
      )
    }

    const certificate: Certificate = {
      id: uuidv4(),
      studentId,
      completionDate: new Date(),
      duration: existingCourse.duration,
      courseId: existingCourse.id,
      instructorId: existingCourse.instructor
    }

    existingStudent.certificates.push(certificate.id)
    await this.certificateContract.createCertificate(ctx, certificate)
    await this.userContract.updateUser(ctx, existingStudent)
    return certificate.id
  }
}
