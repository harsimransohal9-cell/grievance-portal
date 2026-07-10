import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ title: "", description: "", category: "other" });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/my");
      setComplaints(res.data);
    } catch (err) {
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (photo) data.append("photo", photo);

      await API.post("/complaints", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ title: "", description: "", category: "other" });
      setPhoto(null);
      fetchComplaints();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "in-progress") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "resolved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
              CG
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Student • {user?.department || "—"}</p>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">File a new complaint</h2>
          {submitError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Complaint title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <textarea
              name="description"
              placeholder="Describe the issue in detail"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="hostel">Hostel</option>
                <option value="mess">Mess</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your complaints</h2>
          {loading && <p className="text-sm text-slate-500">Loading...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && complaints.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-500">No complaints filed yet.</p>
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
                  {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;