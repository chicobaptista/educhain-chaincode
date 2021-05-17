import { Object } from 'fabric-contract-api'
import { UserPersistence } from './user-persistence'

@Object()
export class UserModel {
  public id: string
  public name: string
  public email: string
  public publicKey: string
  public certificates: string[]

  static mapToPersistence(user: UserModel): UserPersistence {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      publicKey: user.publicKey,
      certificates: JSON.stringify(user.certificates)
    }
  }

  static mapFromPersistence(user: UserPersistence): UserModel {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      publicKey: user.publicKey,
      certificates: JSON.parse(user.certificates)
    }
  }
}
