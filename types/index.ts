export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "SUPPORT" | "USER";
  walletAddress: string | null;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: "GENERAL" | "TECHNICAL" | "BILLING" | "FEATURE_REQUEST" | "BUG";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedId: string | null;
  txHash: string | null;
  createdBy: User;
  assignedTo: User | null;
}; 