import { headers } from 'next/headers'

export function checkAuth() {
    const headersList = headers()
    const authHeader = headersList.get('authorization')

    if (!authHeader) {
        throw new Error('Authentication required')
    }

    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user !== process.env.AUTH_USER || pwd !== process.env.AUTH_PASSWORD) {
        throw new Error('Invalid credentials')
    }
} 