import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction
} from 'fabric-contract-api'
import { UserPersistence } from './user-persistence'
import { UserModel } from './user-model'

@Info({ title: 'UserContract', description: 'My Smart Contract' })
export class UserContract extends Contract {
  @Transaction(false)
  @Returns('boolean')
  public async userExists(ctx: Context, userId: string): Promise<boolean> {
    const data: Uint8Array = await ctx.stub.getState(userId)
    return !!data && data.length > 0
  }

  @Transaction()
  public async createUser(ctx: Context, user: UserModel): Promise<string> {
    const exists: boolean = await this.userExists(ctx, user.id)
    if (exists) {
      throw new Error(`The user ${user.id} already exists`)
    }
    const savedId = await this.saveUser(ctx, user)
    return savedId
  }

  @Transaction(false)
  @Returns('User')
  public async readUser(ctx: Context, userId: string): Promise<UserModel> {
    const exists: boolean = await this.userExists(ctx, userId)
    if (!exists) {
      throw new Error(`The user ${userId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(userId)
    const pUser: UserPersistence = JSON.parse(data.toString())
    const user = UserModel.mapFromPersistence(pUser)
    return user
  }

  @Transaction()
  public async updateUser(ctx: Context, user: UserModel): Promise<string> {
    const exists: boolean = await this.userExists(ctx, user.id)
    if (!exists) {
      throw new Error(`The user ${user.id} does not exist`)
    }
    const existingUser: UserModel = await this.readUser(ctx, user.id)
    const newUser = { ...existingUser, ...user }
    const savedId = await this.saveUser(ctx, newUser)
    return savedId
  }

  @Transaction()
  public async deleteUser(ctx: Context, userId: string): Promise<string> {
    const exists: boolean = await this.userExists(ctx, userId)
    if (!exists) {
      throw new Error(`The user ${userId} does not exist`)
    }
    await ctx.stub.deleteState(userId)
    return userId
  }

  async saveUser(ctx: Context, user: UserModel): Promise<string> {
    const pUser: UserPersistence = UserModel.mapToPersistence(user)
    const buffer: Buffer = Buffer.from(JSON.stringify(pUser))
    await ctx.stub.putState(user.id, buffer)
    return user.id
  }
}
