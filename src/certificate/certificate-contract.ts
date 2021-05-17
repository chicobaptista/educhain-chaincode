import { Context, Contract, Returns, Transaction } from 'fabric-contract-api'
import { CourseContract } from '../index'
import { UserContract } from '../index'
import { CertificateModel } from './certificate-model'
import { CertificatePersistence } from './certificate-persistence'

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
    certificate: CertificateModel
  ): Promise<string> {
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
    const savedId = await this.saveCertificate(ctx, certificate)
    return savedId
  }

  @Transaction(false)
  @Returns('Certificate')
  public async readCertificate(
    ctx: Context,
    certificateId: string
  ): Promise<CertificateModel> {
    const exists: boolean = await this.certificateExists(ctx, certificateId)
    if (!exists) {
      throw new Error(`The certificate ${certificateId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(certificateId)
    const pCertificate: CertificatePersistence = JSON.parse(
      data.toString()
    ) as CertificatePersistence

    const certificate = CertificateModel.mapFromPersistence(pCertificate)
    return certificate
  }

  async saveCertificate(
    ctx: Context,
    certificate: CertificateModel
  ): Promise<string> {
    const pCertificate: CertificatePersistence = CertificateModel.mapToPersistence(
      certificate
    )
    const buffer: Buffer = Buffer.from(JSON.stringify(pCertificate))
    await ctx.stub.putState(certificate.id, buffer)
    return certificate.id
  }
}
