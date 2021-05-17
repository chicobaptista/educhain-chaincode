import { Object, Property } from 'fabric-contract-api'

@Object()
export class CoursePersistence {
  @Property()
  public id: string

  @Property()
  public name: string

  @Property()
  public duration: number

  @Property()
  public instructor: string

  @Property()
  public students: string
}
