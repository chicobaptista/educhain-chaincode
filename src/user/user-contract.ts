/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction
} from 'fabric-contract-api'
import { User } from './user'

@Info({ title: 'UserContract', description: 'My Smart Contract' })
export class UserContract extends Contract {
  @Transaction(false)
  @Returns('boolean')
  public async userExists(ctx: Context, userId: string): Promise<boolean> {
    const data: Uint8Array = await ctx.stub.getState(userId)
    return !!data && data.length > 0
  }

  @Transaction()
  public async createUser(ctx: Context, user: User): Promise<void> {
    const exists: boolean = await this.userExists(ctx, user.id)
    if (exists) {
      throw new Error(`The user ${user.id} already exists`)
    }
    const buffer: Buffer = Buffer.from(JSON.stringify(user))
    await ctx.stub.putState(user.id, buffer)
  }

  @Transaction(false)
  @Returns('User')
  public async readUser(ctx: Context, userId: string): Promise<User> {
    const exists: boolean = await this.userExists(ctx, userId)
    if (!exists) {
      throw new Error(`The user ${userId} does not exist`)
    }
    const data: Uint8Array = await ctx.stub.getState(userId)
    const student: User = JSON.parse(data.toString()) as User
    return student
  }

  @Transaction()
  public async updateUser(ctx: Context, user: User): Promise<void> {
    const exists: boolean = await this.userExists(ctx, user.id)
    if (!exists) {
      throw new Error(`The user ${user.id} does not exist`)
    }
    const buffer: Buffer = Buffer.from(JSON.stringify(user))
    await ctx.stub.putState(user.id, buffer)
  }

  @Transaction()
  public async deleteUser(ctx: Context, userId: string): Promise<void> {
    const exists: boolean = await this.userExists(ctx, userId)
    if (!exists) {
      throw new Error(`The user ${userId} does not exist`)
    }
    await ctx.stub.deleteState(userId)
  }
}
