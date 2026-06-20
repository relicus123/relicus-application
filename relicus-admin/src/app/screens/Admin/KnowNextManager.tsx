import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Plus, Edit2, Trash2, Compass, Check, AlertCircle, X, Sparkles, MapPin } from "lucide-react";

// Sandbox fallback data removed as per production directive

export function KnowNextManager() {
  const [activeTab, setActiveTab] = useState<"careers" | "colleges" | "scholarships">("careers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Loaded items states
  const [careers, setCareers] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);

  // Selection states
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [careerForm, setCareerForm] = useState({
    id: "",
    name: "",
    category: "Technology",
    stage: "all",
    salary_range: "",
    demand_level: "High",
    overview: "",
  });

  const [collegeForm, setCollegeForm] = useState({
    id: "",
    name: "",
    location: "",
    type: "Private",
    rank: 1,
    fee_range: "",
    package_avg: "",
  });

  const [scholarshipForm, setScholarshipForm] = useState({
    id: "",
    name: "",
    provider: "",
    amount: "",
    deadline: "",
    category: "General",
  });



  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setSelectedItem(null);
    setIsEditing(false);
    try {

        // Fetch from Supabase
        if (activeTab === "careers") {
          const { data, error: err } = await supabase.from("knownext_careers").select("*");
          if (err) throw err;
          setCareers(data || []);
        } else if (activeTab === "colleges") {
          const { data, error: err } = await supabase.from("knownext_colleges").select("*");
          if (err) throw err;
          setColleges(data || []);
        } else if (activeTab === "scholarships") {
          const { data, error: err } = await supabase.from("knownext_scholarships").select("*");
          if (err) throw err;
          setScholarships(data || []);
        }
    } catch (err: any) {
      setError("Failed to fetch records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: careerForm.id || `career-${Math.random().toString(36).substr(2, 9)}`,
      name: careerForm.name,
      category: careerForm.category,
      stage: careerForm.stage,
      salary_range: careerForm.salary_range,
      demand_level: careerForm.demand_level,
      overview: careerForm.overview
    };

    try {

        const { error: saveErr } = await supabase.from("knownext_careers").upsert(payload);
        if (saveErr) throw saveErr;
        await loadData();
      setSuccess("Career profile saved.");
      setIsEditing(false);
      resetCareerForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {

        const { error: delErr } = await supabase.from("knownext_careers").delete().eq("id", id);
        if (delErr) throw delErr;
        await loadData();
      setSuccess("Career record deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: collegeForm.id || `coll-${Math.random().toString(36).substr(2, 9)}`,
      name: collegeForm.name,
      location: collegeForm.location,
      type: collegeForm.type,
      rank: Number(collegeForm.rank),
      fee_range: collegeForm.fee_range,
      package_avg: collegeForm.package_avg
    };

    try {

        const { error: saveErr } = await supabase.from("knownext_colleges").upsert(payload);
        if (saveErr) throw saveErr;
        await loadData();
      setSuccess("College details saved.");
      setIsEditing(false);
      resetCollegeForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {

        const { error: delErr } = await supabase.from("knownext_colleges").delete().eq("id", id);
        if (delErr) throw delErr;
        await loadData();
      setSuccess("College record deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: scholarshipForm.id || `schol-${Math.random().toString(36).substr(2, 9)}`,
      name: scholarshipForm.name,
      provider: scholarshipForm.provider,
      amount: scholarshipForm.amount,
      deadline: scholarshipForm.deadline,
      category: scholarshipForm.category
    };

    try {

        const { error: saveErr } = await supabase.from("knownext_scholarships").upsert(payload);
        if (saveErr) throw saveErr;
        await loadData();
      setSuccess("Scholarship details saved.");
      setIsEditing(false);
      resetScholarshipForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {

        const { error: delErr } = await supabase.from("knownext_scholarships").delete().eq("id", id);
        if (delErr) throw delErr;
        await loadData();
      setSuccess("Scholarship record deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetCareerForm = () => {
    setCareerForm({ id: "", name: "", category: "Technology", stage: "all", salary_range: "", demand_level: "High", overview: "" });
  };

  const resetCollegeForm = () => {
    setCollegeForm({ id: "", name: "", location: "", type: "Private", rank: 1, fee_range: "", package_avg: "" });
  };

  const resetScholarshipForm = () => {
    setScholarshipForm({ id: "", provider: "", name: "", amount: "", deadline: "", category: "General" });
  };

  const startEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditing(true);
    if (activeTab === "careers") {
      setCareerForm({
        id: item.id,
        name: item.name,
        category: item.category,
        stage: item.stage,
        salary_range: item.salary_range || "",
        demand_level: item.demand_level || "High",
        overview: item.overview || "",
      });
    } else if (activeTab === "colleges") {
      setCollegeForm({
        id: item.id,
        name: item.name,
        location: item.location,
        type: item.type || "Private",
        rank: item.rank || 1,
        fee_range: item.fee_range || "",
        package_avg: item.package_avg || "",
      });
    } else if (activeTab === "scholarships") {
      setScholarshipForm({
        id: item.id,
        name: item.name,
        provider: item.provider || "",
        amount: item.amount || "",
        deadline: item.deadline || "",
        category: item.category || "General",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-amber-500" /> KnowNext Guidance Manager
          </h2>
          <p className="text-sm text-slate-500">Configure careers database lists, roadmaps, colleges and scholarships.</p>
        </div>

      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Tab bar selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {(["careers", "colleges", "scholarships"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab
                ? "border-[#1C4966] text-[#1C4966] dark:border-[#8FBDD7] dark:text-[#8FBDD7]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === "careers" ? "Careers Registry" : tab === "colleges" ? "Colleges Explorer" : "Scholarships list"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Items List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 capitalize">{activeTab} catalog</h3>
            <button
              onClick={() => {
                setSelectedItem(null);
                setIsEditing(true);
                resetCareerForm();
                resetCollegeForm();
                resetScholarshipForm();
              }}
              className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:opacity-85"
            >
              <Plus className="h-4.5 w-4.5" /> Add
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Loading catalog...</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeTab === "careers" && careers.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 group">
                  <div>
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                    <span className="block text-[10px] text-slate-400">{item.category} • {item.salary_range}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditItem(item)} className="p-1 text-slate-400 hover:text-slate-600"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteCareer(item.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}

              {activeTab === "colleges" && colleges.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 group">
                  <div>
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                    <span className="block text-[10px] text-slate-400">{item.location} • Rank #{item.rank}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditItem(item)} className="p-1 text-slate-400 hover:text-slate-600"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteCollege(item.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}

              {activeTab === "scholarships" && scholarships.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 group">
                  <div>
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                    <span className="block text-[10px] text-slate-400">{item.provider} • {item.amount}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditItem(item)} className="p-1 text-slate-400 hover:text-slate-600"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteScholarship(item.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Edit/View Form Panel */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {activeTab === "careers" && (
                <form onSubmit={handleSaveCareer} className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Configure Career Profile</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="Career ID (e.g. cloud-architect)"
                      disabled={!!selectedItem}
                      value={careerForm.id}
                      onChange={(e) => setCareerForm({ ...careerForm, id: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-slate-50/50"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Career Name"
                      value={careerForm.name}
                      onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={careerForm.category}
                      onChange={(e) => setCareerForm({ ...careerForm, category: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Salary Range"
                      value={careerForm.salary_range}
                      onChange={(e) => setCareerForm({ ...careerForm, salary_range: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                  </div>
                  <textarea
                    placeholder="Provide overview details..."
                    value={careerForm.overview}
                    onChange={(e) => setCareerForm({ ...careerForm, overview: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border p-2 text-xs bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[#1C4966] text-white px-3 py-1.5 text-xs font-semibold">Save Career</button>
                  </div>
                </form>
              )}

              {activeTab === "colleges" && (
                <form onSubmit={handleSaveCollege} className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Configure College Profile</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="College ID (e.g. harvard)"
                      disabled={!!selectedItem}
                      value={collegeForm.id}
                      onChange={(e) => setCollegeForm({ ...collegeForm, id: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-slate-50/50"
                    />
                    <input
                      type="text"
                      required
                      placeholder="College Name"
                      value={collegeForm.name}
                      onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={collegeForm.location}
                      onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Fee Range"
                      value={collegeForm.fee_range}
                      onChange={(e) => setCollegeForm({ ...collegeForm, fee_range: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[#1C4966] text-white px-3 py-1.5 text-xs font-semibold">Save College</button>
                  </div>
                </form>
              )}

              {activeTab === "scholarships" && (
                <form onSubmit={handleSaveScholarship} className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Configure Scholarship Details</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="Scholarship ID (e.g. commonwealth)"
                      disabled={!!selectedItem}
                      value={scholarshipForm.id}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, id: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-slate-50/50"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Scholarship Name"
                      value={scholarshipForm.name}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Provider Name"
                      value={scholarshipForm.provider}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, provider: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Amount Value"
                      value={scholarshipForm.amount}
                      onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                      className="rounded-xl border p-2 text-xs bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                    <button type="submit" className="rounded-lg bg-[#1C4966] text-white px-3 py-1.5 text-xs font-semibold">Save Scholarship</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
              <Compass className="mb-2 h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">Select an item on the left panel catalog to view parameters, or click "Add" to configure a new record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default KnowNextManager;
