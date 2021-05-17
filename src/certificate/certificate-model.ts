import { v4 as uuidv4 } from 'uuid'
import { CertificatePersistence } from './certificate-persistence'

export class CertificateModel {
  public id: uuidv4
  public studentId: string
  public completionDate: Date
  public duration: number
  public courseId: string
  public instructorId: string

  static mapToPersistence(
    certificate: CertificateModel
  ): CertificatePersistence {
    return {
      id: certificate.id,
      studentId: certificate.studentId,
      completionDate: certificate.completionDate.toString(),
      duration: certificate.duration,
      courseId: certificate.courseId,
      instructorId: certificate.instructorId
    }
  }

  static mapFromPersistence(
    pCertificate: CertificatePersistence
  ): CertificateModel {
    return {
      id: pCertificate.id,
      studentId: pCertificate.studentId,
      completionDate: new Date(pCertificate.completionDate),
      duration: pCertificate.duration,
      courseId: pCertificate.courseId,
      instructorId: pCertificate.instructorId
    }
  }
}
