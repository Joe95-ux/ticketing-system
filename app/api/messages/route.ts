import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 })
    }

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          }
        },
        recipient: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return Response.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    const message = await db.message.create({
      data: {
        content: data.content,
        senderId: session.user.id,
        recipientId: data.recipientId,
      }
    })

    return Response.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 