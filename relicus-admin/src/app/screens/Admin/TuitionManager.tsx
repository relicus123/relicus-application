import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Users, BookOpen, FileText, Check, AlertCircle, X } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export function TuitionManager() {
  const [activeTab, setActiveTab] = useState<"classes" | "assignments" | "students">("classes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);

  const [classForm, setClassForm] = useState({ subject: "", grade: "", time: "", teacher: "" });
  const [assignmentForm, setAssignmentForm] = useState({ class_id: "", title: "", description: "", due_date: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "classes") {
        const { data, error: err } = await supabase.from("tuition_classes").select("*").order("created_at", { ascending: false });
        if (err) throw err;
        setClasses(data || []);
      } else if (activeTab === "students") {
        const { data, error: err } = await supabase.from("profiles").select("*").eq("role", "student");
        if (err) throw err;
        setStudents(data || []);
      } else if (activeTab === "assignments") {
        const { data, error: err } = await supabase.from("tuition_assignments").select("*, tuition_classes(subject, grade)").order("created_at", { ascending: false });
        if (err) throw err;
        setAssignments(data || []);
        
        // Ensure we have classes loaded for the assignment dropdown
        if (classes.length === 0) {
          const { data: cData } = await supabase.from("tuition_classes").select("id, subject, grade");
          setClasses(cData || []);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase.from("tuition_classes").insert([classForm]);
      if (err) throw err;
      setSuccess("Class created successfully.");
      setClassForm({ subject: "", grade: "", time: "", teacher: "" });
      setIsAddingClass(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error: err } = await supabase.from("tuition_classes").delete().eq("id", id);
      if (err) throw err;
      setSuccess("Class deleted.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: err } = await supabase.from("tuition_assignments").insert([{
        class_id: assignmentForm.class_id,
        title: assignmentForm.title,
        description: assignmentForm.description,
        due_date: assignmentForm.due_date || null
      }]);
      if (err) throw err;
      setSuccess("Assignment created.");
      setAssignmentForm({ class_id: "", title: "", description: "", due_date: "" });
      setIsAddingAssignment(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error: err } = await supabase.from("tuition_assignments").delete().eq("id", id);
      if (err) throw err;
      setSuccess("Assignment deleted.");
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
            <BookOpen className="h-6 w-6 text-indigo-500" /> Tuition CMS
          </h2>
          <p className="text-sm text-slate-500">Manage live classes, students, and assignments.</p>
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
        <button onClick={() => setActiveTab("classes")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "classes" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Live Classes</button>
        <button onClick={() => setActiveTab("assignments")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "assignments" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Assignments</button>
        <button onClick={() => setActiveTab("students")} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "students" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Students Registry</button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {activeTab === "classes" && (
            <>
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Catalog</h3>
                  <button onClick={() => setIsAddingClass(true)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:opacity-85">
                    <Plus className="h-4.5 w-4.5" /> Add New
                  </button>
                </div>
                <div className="space-y-2">
                  {classes.map(cls => (
                    <div key={cls.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between group">
                      <div>
                        <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-400">{cls.subject}</h4>
                        <p className="text-xs font-semibold">{cls.grade}</p>
                        <p className="text-[10px] text-slate-500">{cls.time} • By: {cls.teacher}</p>
                      </div>
                      <button onClick={() => handleDeleteClass(cls.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {classes.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No classes scheduled.</p>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {isAddingClass ? (
                  <form onSubmit={handleAddClass} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="font-extrabold">New Class</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input type="text" required placeholder="Subject (e.g. Physics)" value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                      <input type="text" required placeholder="Grade/Batch (e.g. Class 12)" value={classForm.grade} onChange={e => setClassForm({ ...classForm, grade: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                      <input type="text" required placeholder="Time (e.g. Mon, Wed 4:00 PM)" value={classForm.time} onChange={e => setClassForm({ ...classForm, time: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                      <input type="text" required placeholder="Teacher Name" value={classForm.teacher} onChange={e => setClassForm({ ...classForm, teacher: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingClass(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button type="submit" className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold">Save Class</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
                    <BookOpen className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-400">Click Add New to schedule a live class.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "assignments" && (
            <>
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Assignments</h3>
                  <button onClick={() => setIsAddingAssignment(true)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:opacity-85">
                    <Plus className="h-4.5 w-4.5" /> Add New
                  </button>
                </div>
                <div className="space-y-2">
                  {assignments.map(ast => (
                    <div key={ast.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between group">
                      <div>
                        <h4 className="font-bold text-sm">{ast.title}</h4>
                        <p className="text-xs font-semibold text-slate-600">{ast.tuition_classes?.subject} ({ast.tuition_classes?.grade})</p>
                        <p className="text-[10px] text-slate-500">Due: {new Date(ast.due_date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeleteAssignment(ast.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {assignments.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No assignments found.</p>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {isAddingAssignment ? (
                  <form onSubmit={handleAddAssignment} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="font-extrabold">New Assignment</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select required value={assignmentForm.class_id} onChange={e => setAssignmentForm({ ...assignmentForm, class_id: e.target.value })} className="rounded-xl border p-2 text-xs bg-white">
                        <option value="" disabled>Select Target Class...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.subject} - {c.grade}</option>)}
                      </select>
                      <input type="text" required placeholder="Assignment Title" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                      <input type="date" required value={assignmentForm.due_date} onChange={e => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })} className="rounded-xl border p-2 text-xs bg-white" />
                    </div>
                    <textarea placeholder="Assignment details and instructions..." rows={4} value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-white" />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingAssignment(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                      <button type="submit" className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold">Publish Assignment</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-64">
                    <FileText className="mb-2 h-10 w-10 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-400">Click Add New to assign coursework.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "students" && (
            <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold">Registered Students</h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{students.length} Total</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {students.map(std => (
                  <div key={std.id} className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold uppercase">
                      {std.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{std.full_name || "Unknown User"}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{std.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-xs text-slate-400 col-span-3 text-center py-10">No students registered yet.</p>}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default TuitionManager;
