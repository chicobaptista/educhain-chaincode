import { v4 as uuidv4 } from 'uuid'
import { UserPersistence } from './user-persistence'

export class UserModel {
  public id: uuidv4
  public name: string
  public email: string
  public publicKey: string
  public certificates: uuidv4[]

  static mapToPersistence(user: UserModel): UserPersistence {
    return {
      id: user.id.toString(),
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
