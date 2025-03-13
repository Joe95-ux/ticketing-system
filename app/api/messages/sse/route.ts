import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return new Response("Missing userId", { status: 400 })
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Function to send message updates
      const sendUpdate = async () => {
        try {
          const messages = await db.message.findMany({
            where: {
              OR: [
                {
                  AND: [
                    { senderId: session.user.id },
                    { recipientId: userId }
                  ]
                },
                {
                  AND: [
                    { senderId: userId },
                    { recipientId: session.user.id }
                  ]
                }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              sender: {
                select: {
                  name: true,
                  image: true
                }
              }
            }
          })

          if (messages.length > 0) {
            const message = messages[0]
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
          }
        } catch (error) {
          console.error('Error fetching messages:', error)
          controller.error(error)
        }
      }

      // Send updates every 1 second
      const interval = setInterval(sendUpdate, 1000)

      // Cleanup on close
      return () => {
        clearInterval(interval)
      }
    }
  })

  return new Response(stream, { headers })
} 