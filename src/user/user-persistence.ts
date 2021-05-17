/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api'

@Object()
export class UserPersistence {
  @Property()
  public id: string

  @Property()
  public name: string

  @Property()
  public email: string

  @Property()
  public publicKey: string

  @Property()
  public certificates: string
}
