
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from "../services/api";

import type { Lead } from "../types/lead";

import {
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  budget: "",
  location: "",
  source: "website",
};

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setError("");
      const data = await getLeads();
      setLeads(data);
    } catch {
      setError("Unable to load leads. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Open create form
  const openCreateForm = () => {
    setEditingLead(null);
    setForm(initialForm);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);

    setForm({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || "",
      budget: String(lead.budget),
      location: lead.location,
      source: lead.source,
    });

    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingLead(null);
    setForm(initialForm);
  };

  // Create or update lead
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const leadData = {
        ...form,
        budget: Number(form.budget),
      };

      if (editingLead) {
        await updateLead(editingLead._id, leadData);
      } else {
        await createLead(leadData);
      }

      closeForm();
      await fetchLeads();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save lead"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete lead
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteLead(id);
      await fetchLeads();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete lead"
      );
    }
  };

  // Search
  const filteredLeads = leads.filter((lead) =>
    `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Leads
          </h1>

          <p className="text-slate-500 mt-1">
            Manage and track your potential customers.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">
              {editingLead ? "Edit Lead" : "Create New Lead"}
            </h2>

            <button type="button" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              className={inputClass}
              placeholder="First name"
              required
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder="Last name"
              required
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
            />

            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="Budget (MAD)"
              required
              value={form.budget}
              onChange={(e) =>
                setForm({ ...form, budget: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder="Location"
              required
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />

            <select
              className={inputClass}
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value })
              }
            >
              <option value="website">Website</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingLead
                    ? "Update Lead"
                    : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <Search size={20} className="text-slate-400" />

        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="outline-none w-full text-sm"
        />
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading leads...
          </p>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-slate-300" size={40} />
            <p className="mt-3 text-slate-500">
              No leads found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">

              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">

                    <td className="p-4 font-medium text-slate-800">
                      {lead.firstName} {lead.lastName}
                    </td>

                    <td className="p-4 text-slate-500">
                      {lead.email}
                    </td>

                    <td className="p-4 text-slate-500">
                      {lead.location}
                    </td>

                    <td className="p-4">
                      {lead.budget?.toLocaleString()} MAD
                    </td>

                    <td className="p-4 font-semibold">
                      {lead.leadScore}/100
                    </td>

                    <td className="p-4 capitalize">
                      {lead.priority}
                    </td>

                    <td className="p-4 capitalize">
                      {lead.status}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">

                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit lead"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete lead"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500">
        {filteredLeads.length} leads found
      </p>

    </div>
  );
}

export default Leads;
