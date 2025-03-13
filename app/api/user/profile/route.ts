import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        image: true,
      },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
      },
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 