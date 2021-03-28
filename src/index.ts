/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserContract } from './user/user-contract'
export { UserContract } from './user/user-contract'
import { CourseContract } from './course/course-contract'
export { CourseContract } from './course/course-contract'
import { CertificateContract } from './certificate/certificate-contract'
export { CertificateContract } from './certificate/certificate-contract'
export const contracts: any[] = [
  UserContract,
  CourseContract,
  CertificateContract
]
