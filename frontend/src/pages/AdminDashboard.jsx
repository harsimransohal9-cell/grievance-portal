import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [escalating, setEscalating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await API.get("/complaints", { params });
      setComplaints(res.data);
    } catch (err) {
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const runEscalation = async () => {
    setEscalating(true);
    try {
      await API.post("/complaints/run-escalation");
      fetchComplaints();
    } catch (err) {
      alert("Failed to run escalation check");
    } finally {
      setEscalating(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "in-progress") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "resolved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const counts = {
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    escalated: complaints.filter((c) => c.escalated).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
              CG
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-amber-600">{counts.pending}</p>
            <p className="text-xs text-slate-500 mt-1">Pending</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-blue-600">{counts.inProgress}</p>
            <p className="text-xs text-slate-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-emerald-600">{counts.resolved}</p>
            <p className="text-xs text-slate-500 mt-1">Resolved</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-red-600">{counts.escalated}</p>
            <p className="text-xs text-slate-500 mt-1">Escalated</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Categories</option>
            <option value="hostel">Hostel</option>
            <option value="mess">Mess</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="academic">Academic</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={runEscalation}
            disabled={escalating}
            className="ml-auto text-sm font-medium bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
          >
            {escalating ? "Checking..." : "Run escalation check"}
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && complaints.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500">No complaints found.</p>
          </div>
        )}

        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-medium text-slate-900">{c.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border whitespace-nowrap ${statusStyle(c.status)}`}>
                  {c.status}{c.escalated && " ⚠"}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{c.description}</p>
              <p className="text-xs text-slate-400 mt-2">
                {c.student?.name} ({c.student?.email}) • {c.student?.department} • {c.category}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-slate-500">Update status:</label>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c._id, e.target.value)}
                  className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;