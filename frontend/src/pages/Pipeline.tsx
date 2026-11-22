
import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import { getLeads, updateLead } from "../services/api";
import type { Lead } from "../types/lead";
import { Users, MapPin, GripVertical } from "lucide-react";

const stages = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "contacted", label: "Contacted", color: "bg-cyan-500" },
  { id: "qualified", label: "Qualified", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "converted", label: "Converted", color: "bg-green-500" },
  { id: "lost", label: "Lost", color: "bg-red-500" },
];

function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load leads from MongoDB through Express
  const fetchLeads = async () => {
    try {
      setError("");
      const data = await getLeads();
      setLeads(data);
    } catch {
      setError("Unable to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Move a lead to another stage
  const handleDrop = async (
    event: DragEvent<HTMLDivElement>,
    newStatus: string
  ) => {
    event.preventDefault();

    const leadId = event.dataTransfer.getData("text/plain");
    const lead = leads.find((item) => item._id === leadId);

    if (!lead || lead.status === newStatus || updatingId) return;

    setUpdatingId(leadId);
    setError("");

    try {
      await updateLead(leadId, { status: newStatus });

      setLeads((currentLeads) =>
        currentLeads.map((item) =>
          item._id === leadId
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch {
      setError("Unable to update lead status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <p className="text-slate-500 p-8 text-center">
        Loading pipeline...
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Sales Pipeline
        </h1>
        <p className="text-slate-500 mt-1">
          Track your leads through every stage of the sales process.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => {
          const count = leads.filter(
            (lead) => lead.status === stage.id
          ).length;

          return (
            <div
              key={stage.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className={`w-2 h-2 rounded-full ${stage.color} mb-3`} />
              <p className="text-sm text-slate-500">{stage.label}</p>
              <p className="text-2xl font-bold text-slate-800">
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">

        {stages.map((stage) => {
          const stageLeads = leads.filter(
            (lead) => lead.status === stage.id
          );

          return (
            <div
              key={stage.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, stage.id)}
              className="min-w-[260px] w-[260px] shrink-0 bg-slate-100 rounded-xl p-3 min-h-[400px]"
            >

              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <h2 className="font-semibold text-slate-700">
                    {stage.label}
                  </h2>
                </div>

                <span className="text-xs font-semibold bg-white text-slate-500 px-2.5 py-1 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead cards */}
              <div className="space-y-3">

                {stageLeads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable={updatingId !== lead._id}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "text/plain",
                        lead._id
                      );
                    }}
                    className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition ${
                      updatingId === lead._id
                        ? "opacity-50"
                        : ""
                    }`}
                  >

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {lead.firstName} {lead.lastName}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {lead.email}
                        </p>
                      </div>

                      <GripVertical
                        size={18}
                        className="text-slate-300"
                      />
                    </div>

                    <div className="mt-4 space-y-2">

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={14} />
                        {lead.location}
                      </div>

                      <div className="text-sm font-medium text-slate-700">
                        {lead.budget?.toLocaleString()} MAD
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          AI Score
                        </span>

                        <span className="text-sm font-bold text-blue-600">
                          {lead.leadScore}/100
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Priority
                        </span>

                        <span
                          className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${
                            lead.priority === "hot"
                              ? "bg-red-100 text-red-600"
                              : lead.priority === "warm"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <Users
                      size={22}
                      className="mx-auto text-slate-300 mb-2"
                    />
                    <p className="text-xs text-slate-400">
                      Drop leads here
                    </p>
                  </div>
                )}

              </div>
            </div>
          );
        })}

      </div>

      <p className="text-xs text-slate-400">
        Drag and drop a lead card to change its stage.
      </p>

    </div>
  );
}

export default Pipeline;
