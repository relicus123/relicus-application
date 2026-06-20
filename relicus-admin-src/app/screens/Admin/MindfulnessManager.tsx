import React, { useState, useEffect } from "react";
import { Plus, Trash2, Heart, Activity, CheckSquare, Edit2, Check, AlertCircle, X, Sparkles } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export function MindfulnessManager() {
  const [activeTab, setActiveTab] = useState<"activities" | "affirmations" | "tasks">("activities");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activities, setActivities] = useState<any[]>([]);
  const [affirmations, setAffirmations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isAddingAffirmation, setIsAddingAffirmation] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [activityForm, setActivityForm] = useState({ title: "", description: "", duration: "5 mins" });
  const [affirmationForm, setAffirmationForm] = useState({ text: "", category: "General" });
  const [taskForm, setTaskForm] = useState({ title: "", reward_points: 10 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "activities") {
        const { data, error: err } = await supabase.from("mindfulness_activities").select("*").order("created_at", { ascending: false });
        if (err) throw err;
        setActivities(data || []);
      } else if (activeTab === "affirmations") {
        const { data, error: err } = await supabase.from("mindfulness_affirmations").select("*").order("created_at", { ascending: false });
        if (err) throw err;
        setAffirmations(data || []);
      } else if (activeTab === "tasks") {
        const { data, error: err } = await supabase.from("mindfulness_tasks").select("*").order("created_at", { ascending: false });
        if (err) throw err;
        setTasks(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase.from("mindfulness_activities").insert([activityForm]);
      if (err) throw err;
      setSuccess("Activity added.");
      setActivityForm({ title: "", description: "", duration: "5 mins" });
      setIsAddingActivity(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error: err } = await supabase.from("mindfulness_activities").delete().eq("id", id);
      if (err) throw err;
      setSuccess("Activity deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAffirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase.from("mindfulness_affirmations").insert([affirmationForm]);
      if (err) throw err;
      setSuccess("Affirmation added.");
      setAffirmationForm({ text: "", category: "General" });
      setIsAddingAffirmation(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAffirmation = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error: err } = await supabase.from("mindfulness_affirmations").delete().eq("id", id);
      if (err) throw err;
      setSuccess("Affirmation deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase.from("mindfulness_tasks").insert([taskForm]);
      if (err) throw err;
      setSuccess("Task added.");
      setTaskForm({ title: "", reward_points: 10 });
      setIsAddingTask(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error: err } = await supabase.from("mindfulness_tasks").delete().eq("id", id);
      if (err) throw err;
      setSuccess("Task deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" /> Mindfulness CMS
          </h2>
          <p className="text-sm text-slate-500">Configure guided activities, daily affirmations, and wellness tasks.</p>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button onClick={() => setActiveTab("activities")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "activities" ? "border-pink-500 text-pink-600 dark:text-pink-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Guided Activities</button>
        <button onClick={() => setActiveTab("affirmations")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "affirmations" ? "border-pink-500 text-pink-600 dark:text-pink-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Affirmations</button>
        <button onClick={() => setActiveTab("tasks")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "tasks" ? "border-pink-500 text-pink-600 dark:text-pink-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Wellness Tasks</button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {activeTab === "activities" && (
            <>
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Catalog</h3>
                  <button onClick={() => setIsAddingActivity(true)} className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:opacity-85">
                    <Plus className="h-4.5 w-4.5" /> Add New
                  </button>
                </div>
                <div className="space-y-2">
                  {activities.map(act => (
                    <div key={act.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between group">
                      <div>
                        <h4 className="font-bold text-sm">{act.title}</h4>
                        <p className="text-[10px] text-slate-500">{act.duration} • {act.description}</p>
                      </div>
                      <button onClick={() => handleDeleteActivity(act.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No activities found.</p>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {isAddingActivity ? (
                  <form onSubmit={handleAddActivity} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="font-extrabold">New Activity</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input type="text" required placeholder="Activity Title (e.g. Deep Breathing)" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} className="rounded-xl border p-2 text-xs bg-slate-50/50" />
                      <input type="text" placeholder="Duration (e.g. 5 mins)" value={activityForm.duration} onChange={e => setActivityForm({ ...activityForm, duration: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                    </div>
                    <textarea placeholder="Description" rows={3} value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingActivity(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button type="submit" className="rounded-lg bg-pink-600 text-white px-3 py-1.5 text-xs font-semibold">Save Activity</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
                    <Activity className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-400">Click Add New to configure a guided activity.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "affirmations" && (
            <>
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Catalog</h3>
                  <button onClick={() => setIsAddingAffirmation(true)} className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:opacity-85">
                    <Plus className="h-4.5 w-4.5" /> Add New
                  </button>
                </div>
                <div className="space-y-2">
                  {affirmations.map(aff => (
                    <div key={aff.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between group">
                      <div>
                        <h4 className="font-bold text-sm">"{aff.text}"</h4>
                        <p className="text-[10px] text-slate-500">Category: {aff.category}</p>
                      </div>
                      <button onClick={() => handleDeleteAffirmation(aff.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {affirmations.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No affirmations found.</p>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {isAddingAffirmation ? (
                  <form onSubmit={handleAddAffirmation} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="font-extrabold">New Affirmation</h4>
                    <div className="space-y-3">
                      <input type="text" required placeholder="Affirmation Quote" value={affirmationForm.text} onChange={e => setAffirmationForm({ ...affirmationForm, text: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                      <input type="text" placeholder="Category (e.g. Motivation)" value={affirmationForm.category} onChange={e => setAffirmationForm({ ...affirmationForm, category: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingAffirmation(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button type="submit" className="rounded-lg bg-pink-600 text-white px-3 py-1.5 text-xs font-semibold">Save Affirmation</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
                    <Activity className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-400">Click Add New to configure a daily affirmation.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "tasks" && (
            <>
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Catalog</h3>
                  <button onClick={() => setIsAddingTask(true)} className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:opacity-85">
                    <Plus className="h-4.5 w-4.5" /> Add New
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.map(tsk => (
                    <div key={tsk.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between group">
                      <div>
                        <h4 className="font-bold text-sm">{tsk.title}</h4>
                        <p className="text-[10px] text-slate-500">+{tsk.reward_points} pts</p>
                      </div>
                      <button onClick={() => handleDeleteTask(tsk.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No tasks found.</p>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {isAddingTask ? (
                  <form onSubmit={handleAddTask} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="font-extrabold">New Task</h4>
                    <div className="space-y-3">
                      <input type="text" required placeholder="Task Title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                      <input type="number" required placeholder="Reward Points" value={taskForm.reward_points} onChange={e => setTaskForm({ ...taskForm, reward_points: Number(e.target.value) })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingTask(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button type="submit" className="rounded-lg bg-pink-600 text-white px-3 py-1.5 text-xs font-semibold">Save Task</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
                    <CheckSquare className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-400">Click Add New to configure a wellness task.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

export default MindfulnessManager;
