
export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  budget: number;
  location: string;
  status: string;
  leadScore: number;
  priority: "hot" | "warm" | "cold";
  aiAnalysis?: string;
  createdAt: string;
}
