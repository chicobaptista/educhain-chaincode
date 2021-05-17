import { Object, Property } from 'fabric-contract-api'

@Object()
export class CertificatePersistence {
  @Property()
  public id: string

  @Property()
  public studentId: string

  @Property()
  public completionDate: string

  @Property()
  public duration: number

  @Property()
  public courseId: string

  @Property()
  public instructorId: string
}
