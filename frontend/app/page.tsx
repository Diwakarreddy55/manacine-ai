 "use client";

import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://manacine-backend.onrender.com/api";

type Project = {
  id:number; title:string; duration_minutes:number; status:string; progress:number; prompt:string;
};

export default function Home() {
  const [token,setToken] = useState("");
  const [projects,setProjects] = useState<Project[]>([]);
  const [form,setForm] = useState({name:"Demo User",email:"demo@example.com",password:"Password123!"});
  const [prompt,setPrompt] = useState("");
  const [duration,setDuration] = useState(5);
  const [message,setMessage] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("manacine_token");
    if (t) { setToken(t); loadProjects(t); }
  }, []);

  async function loginOrRegister() {
    setMessage("Creating account...");
    let r = await fetch(`${API}/auth/register`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    let data = await r.json();
    if (!r.ok) {
      r = await fetch(`${API}/auth/login`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:form.email,password:form.password})
      });
      data = await r.json();
    }
    if (data.token) {
      localStorage.setItem("manacine_token",data.token);
      setToken(data.token);
      loadProjects(data.token);
      setMessage("Logged in");
    } else setMessage(data.message || "Login failed");
  }

  async function loadProjects(t=token) {
    const r = await fetch(`${API}/projects`, {headers:{Authorization:`Bearer ${t}`}});
    if (r.ok) setProjects(await r.json());
  }

  async function createProject() {
    if (!prompt.trim()) return setMessage("Enter your movie prompt.");
    const r = await fetch(`${API}/projects`, {
      method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify({title:"My Telugu AI Movie",prompt,duration_minutes:duration,language:"te"})
    });
    const data = await r.json();
    if (!r.ok) return setMessage(data.message || "Failed");
    setMessage("Project created. Generating story...");
    await fetch(`${API}/projects/${data.id}/generate`, {
      method:"POST",headers:{Authorization:`Bearer ${token}`}
    });
    await loadProjects();
    setMessage("Story and scenes generated.");
  }

  if (!token) return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">🎬 ManaCine AI</h1>
        <p className="mt-2 text-white/60">Create Telugu movies from prompts.</p>
        <div className="mt-8 space-y-3">
          <input className="w-full rounded-xl bg-white/10 p-3" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="w-full rounded-xl bg-white/10 p-3" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input className="w-full rounded-xl bg-white/10 p-3" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          <button onClick={loginOrRegister} className="w-full rounded-xl bg-white text-black p-3 font-semibold">Continue</button>
          <p className="text-sm text-white/50">{message}</p>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div><b className="text-xl">🎬 ManaCine AI</b><span className="ml-3 text-white/40">AI Movie Studio</span></div>
          <button onClick={()=>{localStorage.removeItem("manacine_token");location.reload()}} className="text-sm text-white/50">Logout</button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[.03] p-8">
          <h2 className="text-3xl font-bold">Create your Telugu AI movie</h2>
          <p className="mt-2 text-white/50">Describe the story, characters and style.</p>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
            className="mt-6 min-h-44 w-full rounded-2xl bg-black/40 p-5 outline-none"
            placeholder={"ఉదాహరణ: 10 నిమిషాల తెలుగు కామెడీ సినిమా. హీరో సాఫ్ట్‌వేర్ ఇంజనీర్, హీరోయిన్ డాక్టర్, కమెడియన్ హీరో ఫ్రెండ్. లవ్, కామెడీ, ఫ్యామిలీ ఎమోషన్, హ్యాపీ ఎండింగ్ ఉండాలి."}/>
          <div className="mt-5 flex flex-wrap gap-3">
            {[1,5,10,20].map(x=><button key={x} onClick={()=>setDuration(x)}
              className={`rounded-xl px-5 py-3 ${duration===x?"bg-white text-black":"bg-white/10"}`}>{x} min</button>)}
          </div>
          <button onClick={createProject} className="mt-6 rounded-xl bg-white px-7 py-3 font-semibold text-black">✨ Generate Movie</button>
          <p className="mt-3 text-sm text-white/50">{message}</p>
        </div>

        <h2 className="mt-10 text-xl font-semibold">My Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(p=><div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex justify-between"><b>{p.title}</b><span className="text-xs text-white/50">{p.status}</span></div>
            <p className="mt-2 text-sm text-white/50">{p.duration_minutes} minutes</p>
            <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-white" style={{width:`${p.progress}%`}}/></div>
            <p className="mt-2 text-xs text-white/40">{p.progress}%</p>
          </div>)}
        </div>
      </section>
    </main>
  );
}
