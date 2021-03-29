import { Context, Contract, Returns, Transaction } from 'fabric-contract-api'
import { CourseContract } from '../index'
import { UserContract } from '../index'
import { Certificate } from './certificate'

export class CertificateContract extends Contract {
  userContract = new UserContract()

  @Transaction(false)
  @Returns('boolean')
  public async certificateExists(
    ctx: Context,
    certificateId: string
  ): Promise<boolean> {
    const data: Uint8Array = await ctx.stub.getState(certificateId)
    return !!data && data.length > 0
  }

  @Transaction(true)
  @Returns('string')
  public async createCertificate(
    ctx: Context,
    certificate: Certificate
  ): Promise<void> {
    const exists: boolean = await this.certificateExists(ctx, certificate.id)
    if (exists) {
      throw new Error(`The certificate ${certificate.id} already exists`)
    }
    const courseExists = await this.userContract.userExists(
      ctx,
      certificate.courseId
    )
    if (!courseExists) {
      throw new Error(`The course ${certificate.courseId} does not exist`)
    }

    const instructorExists = await this.userContract.userExists(
      ctx,
      certificate.instructorId
    )
    if (!instructorExists) {
      throw new Error(`The user ${certificate.instructorId} does not exist`)
    }

    const studentExists: boolean = await this.userContract.userExists(
      ctx,
      certificate.studentId
    )
    if (!studentExists) {
      throw new Error(`The user ${certificate.studentId} does not exist`)
    }

    const buffer: Buffer = Buffer.from(JSON.stringify(certificate))
    await ctx.stub.putState(certificate.id, buffer)
    return certificate.id
  }

  @Transaction(false)
  @Returns('Certificate')
  public async readCertificate(
    ctx: Context,
    certificateId: string
  ): Promise<Certificate> {
    const exists: boolean = await this.certificateExists(ctx, certificateId)
    if (!exists) {
      throw new Error(`The certificate ${certificateId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(certificateId)
    const certificate: Certificate = JSON.parse(data.toString()) as Certificate
    return certificate
  }
}
