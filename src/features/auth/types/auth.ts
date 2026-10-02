export interface User {
  id: string
  name: string
  username: string
  email: string
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}
export interface Credentials { email: string; password: string }
