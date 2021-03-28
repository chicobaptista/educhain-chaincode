/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'

@Object()
export class Course {
  @Property()
  public id: uuidv4

  @Property()
  public name: string

  @Property()
  public duration: number

  @Property()
  public instructor: uuidv4

  @Property()
  public students: uuidv4[]
}
