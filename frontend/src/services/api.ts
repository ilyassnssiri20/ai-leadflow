
import type { Lead } from "../types/lead";

const API_URL = "http://localhost:5000/api";

// GET: Retrieve all leads
export const getLeads = async (): Promise<Lead[]> => {
  const response = await fetch(`${API_URL}/leads`);

  if (!response.ok) {
    throw new Error("Unable to fetch leads");
  }

  const result = await response.json();
  return result.data;
};

// POST: Create a lead
export const createLead = async (lead: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget: number;
  location: string;
  source: string;
}) => {
  const response = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to create lead");
  }

  return result.data;
};

// PUT: Update a lead
export const updateLead = async (
  id: string,
  lead: Partial<Lead>
) => {
  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to update lead");
  }

  return result.data;
};

// DELETE: Delete a lead
export const deleteLead = async (id: string) => {
  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to delete lead");
  }

  return result;
};
