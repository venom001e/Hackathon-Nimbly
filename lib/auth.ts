// Dummy Authentication System
// Demo credentials for testing

export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'analyst' | 'viewer'
  email: string
}

// Dummy users database
export const DUMMY_USERS: { username: string; password: string; user: User }[] = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@aadhaar.gov.in'
    }
  },
  {
    username: 'analyst',
    password: 'analyst123',
    user: {
      id: '2',
      username: 'analyst',
      name: 'Data Analyst',
      role: 'analyst',
      email: 'analyst@aadhaar.gov.in'
    }
  },
  {
    username: 'demo',
    password: 'demo123',
    user: {
      id: '3',
      username: 'demo',
      name: 'Demo User',
      role: 'viewer',
      email: 'demo@aadhaar.gov.in'
    }
  }
]

export function validateCredentials(username: string, password: string): User | null {
  const found = DUMMY_USERS.find(
    u => u.username === username && u.password === password
  )
  return found ? found.user : null
}

export function getUserByUsername(username: string): User | null {
  const found = DUMMY_USERS.find(u => u.username === username)
  return found ? found.user : null
}
