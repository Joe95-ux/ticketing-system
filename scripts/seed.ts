import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = "admin@example.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: await hash("admin123", 12),
        role: "ADMIN",
      },
    });
  }

  // Create knowledge base categories and articles
  const categories = [
    {
      name: "Getting Started",
      description: "Essential guides to help you get started with our platform",
      articles: [
        {
          title: "Welcome to TixHub",
          slug: "welcome-to-tixhub",
          excerpt: "Learn about TixHub and how it can help streamline your support process",
          content: `# Welcome to TixHub

TixHub is your all-in-one solution for managing support tickets and knowledge base articles. This guide will help you understand the basics of using our platform.

## Key Features

- **Ticket Management**: Create, track, and resolve support tickets efficiently
- **Knowledge Base**: Access and create helpful articles and guides
- **Real-time Updates**: Get instant notifications about ticket status changes
- **User-friendly Interface**: Navigate easily with our intuitive design

## Getting Started

1. Create your account or sign in
2. Explore the dashboard
3. Create your first ticket
4. Browse the knowledge base

Need help? Don't hesitate to contact our support team!`
        },
        {
          title: "How to Create Your First Ticket",
          slug: "how-to-create-your-first-ticket",
          excerpt: "A step-by-step guide to creating and managing support tickets",
          content: `# Creating Your First Ticket

This guide will walk you through the process of creating and managing your first support ticket.

## Steps to Create a Ticket

1. Click the "New Ticket" button in the navigation
2. Select the appropriate category
3. Fill in the ticket details:
   - Title: A clear, concise description of the issue
   - Description: Detailed information about your request
   - Priority: Select based on urgency
4. Submit your ticket

## Tracking Your Ticket

- View your ticket status in the dashboard
- Receive email notifications for updates
- Add comments to provide additional information
- Close the ticket when resolved

## Best Practices

- Be specific in your description
- Include relevant screenshots or files
- Check the knowledge base first for quick solutions
- Keep communication clear and professional`
        }
      ]
    },
    {
      name: "Account Management",
      description: "Learn how to manage your account settings and preferences",
      articles: [
        {
          title: "Managing Your Profile",
          slug: "managing-your-profile",
          excerpt: "Learn how to update your profile information and preferences",
          content: `# Managing Your Profile

Learn how to customize your profile and manage your account settings.

## Profile Settings

- Update your name and contact information
- Change your profile picture
- Manage notification preferences
- Update your password

## Security Best Practices

- Use a strong password
- Enable two-factor authentication
- Regularly review your account activity
- Keep your contact information up to date

Need to make changes? Visit your profile settings page to get started.`
        }
      ]
    },
    {
      name: "Troubleshooting",
      description: "Common issues and their solutions",
      articles: [
        {
          title: "Common Issues and Solutions",
          slug: "common-issues-and-solutions",
          excerpt: "Quick fixes for frequently encountered problems",
          content: `# Common Issues and Solutions

Find quick solutions to frequently encountered problems.

## Frequently Asked Questions

### Q: I can't log in to my account
- Check your email and password
- Clear your browser cache
- Reset your password if needed

### Q: I'm not receiving notifications
- Check your spam folder
- Verify your email address
- Check notification settings

### Q: The page isn't loading
- Refresh the page
- Clear your browser cache
- Try a different browser

Still having issues? Create a support ticket for personalized assistance.`
        }
      ]
    }
  ];

  // Create categories and articles
  for (const category of categories) {
    const existingCategory = await prisma.knowledgeCategory.findFirst({
      where: { name: category.name },
    });

    if (!existingCategory) {
      await prisma.knowledgeCategory.create({
        data: {
          name: category.name,
          description: category.description,
          articles: {
            create: category.articles,
          },
        },
      });
    }
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 