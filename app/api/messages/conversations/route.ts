import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get all users who have exchanged messages with the current user
    const conversations = await db.user.findMany({
      where: {
        OR: [
          {
            sentMessages: {
              some: {
                recipientId: session.user.id
              }
            }
          },
          {
            receivedMessages: {
              some: {
                senderId: session.user.id
              }
            }
          }
        ],
        NOT: {
          id: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    })

    // Get the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (user) => {
        const lastMessage = await db.message.findFirst({
          where: {
            OR: [
              {
                AND: [
                  { senderId: session.user.id },
                  { recipientId: user.id }
                ]
              },
              {
                AND: [
                  { senderId: user.id },
                  { recipientId: session.user.id }
                ]
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            recipientId: true,
            createdAt: true,
            sender: {
              select: {
                name: true,
                image: true
              }
            }
          }
        })

        return {
          user,
          lastMessage
        }
      })
    )

    return Response.json(conversationsWithLastMessage)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 