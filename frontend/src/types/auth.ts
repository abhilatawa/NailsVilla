export type Role = 'CUSTOMER' | 'ADMIN'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
}

export interface AccessTokenResponse {
  accessToken: string
  expiresInSeconds: number
  user: AuthUser
}
