import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create support users
  const supportUsers = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      return prisma.user.create({
        data: {
          name: `Support User ${i + 1}`,
          email: `support${i + 1}@example.com`,
          password: await hash("password123", 10),
          role: "SUPPORT",
        },
      });
    })
  );

  // Create an admin user for testing
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: await hash("password123", 10),
      role: "ADMIN",
    },
  });

  // Categories and their sample titles
  const categories = {
    GENERAL: [
      "Account access issue",
      "Update contact information",
      "Subscription inquiry",
      "General feedback",
      "Service availability",
      "Documentation request",
    ],
    TECHNICAL: [
      "API integration error",
      "Database connection issue",
      "Server downtime report",
      "Performance optimization",
      "Security concern",
      "Authentication problem",
    ],
    BILLING: [
      "Invoice discrepancy",
      "Payment processing error",
      "Refund request",
      "Subscription upgrade",
      "Billing cycle question",
      "Payment method update",
    ],
    FEATURE_REQUEST: [
      "Mobile app enhancement",
      "New integration suggestion",
      "UI/UX improvement",
      "Analytics feature request",
      "Export functionality",
      "Custom reporting tool",
    ],
    BUG: [
      "Login page error",
      "Data sync issue",
      "Mobile app crash",
      "Chart rendering bug",
      "Export function failure",
      "Search functionality issue",
    ],
  } as const;

  // Create tickets for each category
  for (const [category, titles] of Object.entries(categories)) {
    await Promise.all(
      titles.map(async (title, index) => {
        const assignedToUser = supportUsers[index % supportUsers.length];
        
        const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
        const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
        
        return prisma.ticket.create({
          data: {
            title,
            description: `Detailed description for ${title.toLowerCase()}. This is a sample ticket created for testing purposes.`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            category: category as "GENERAL" | "TECHNICAL" | "BILLING" | "FEATURE_REQUEST" | "BUG",
            userId: admin.id,
            assignedId: assignedToUser.id,
          },
        });
      })
    );
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 