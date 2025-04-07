import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type ActivityAction =
  | "created_ticket"
  | "updated_ticket"
  | "added_comment"
  | "changed_status"
  | "changed_priority"
  | "assigned_ticket"
  | "resolved_ticket"
  | "closed_ticket"
  | "reopened_ticket";

interface LogActivityProps {
  action: ActivityAction;
  userId: string;
  ticketId?: string;
  details: Prisma.InputJsonValue;
}

export async function logActivity({
  action,
  userId,
  ticketId,
  details,
}: LogActivityProps) {
  try {
    await db.activityLog.create({
      data: {
        action,
        userId,
        ticketId,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw the error as logging failure shouldn't break the main flow
  }
} 