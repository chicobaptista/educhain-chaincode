/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'

@Object()
export class Certificate {
  @Property()
  public id: uuidv4

  @Property()
  public studentId: string

  @Property()
  public completionDate: Date

  @Property()
  public duration: number

  @Property()
  public courseId: string

  @Property()
  public instructorId: string
}
