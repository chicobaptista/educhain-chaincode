/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'

@Object()
export class User {
  @Property()
  public id: uuidv4

  @Property()
  public name: string

  @Property()
  public email: string

  @Property()
  public publicKey: string

  @Property()
  public certificates: uuidv4[]
}
