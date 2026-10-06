import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, BarChart3, BookOpen, Check, CheckCircle2, GitCompare,
  ChevronRight, CircleDollarSign, Clock3, FileCheck2, History, HeartPulse,
  LayoutDashboard, LineChart, LogOut, Menu, Moon, RefreshCw, ShieldCheck,
  Sparkles, Target, UserRound, WalletCards, X, Zap, Settings2, Search, Trash2, Maximize2, Minimize2, Volume2, VolumeX, Sun, Moon as MoonIcon
} from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate
} from "react-router-dom";
import axios from "axios";
import { localAIAnswer, isLocalAIAvailable } from "./localAI.js";
import "./styles.css";
import Forecasting, { Simulation } from "./Forecasting.jsx";
import DigitalTwin from "./Milestone3.jsx";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("riskintel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const saveAuth = (data) => {
  localStorage.setItem("riskintel_token", data.access_token);
  localStorage.setItem("riskintel_user", JSON.stringify(data.user));
};

const getUser = () => JSON.parse(localStorage.getItem("riskintel_user") || "{}");

function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="orb orb-one" />
      <span className="orb orb-two" />
      <span className="orb orb-three" />
      <div className="grid-glow" />
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark"><ShieldCheck size={19} /></span>
      <span>RiskIntel <b>AI</b></span>
    </div>
  );
}

function Auth({ register = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(register
    ? { full_name: "", email: "", password: "" }
    : { email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post(register ? "/auth/register" : "/auth/login", form);
      saveAuth(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to complete the request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AmbientBackground />
      <div className="auth-shell">
        <div className="auth-brand"><Brand /></div>
        <div className="auth-grid">
          <div className="auth-story">
            <div className="eyebrow"><Sparkles size={14} /> INTELLIGENT RISK OPERATIONS</div>
            <h1>Know your risk.<br /><span>Act with confidence.</span></h1>
            <p>
              RiskIntel turns financial, study and habit signals into a structured
              personal risk profile ready for intelligent analysis.
            </p>
            <div className="story-pills">
              <span><ShieldCheck size={14} /> Secure by design</span>
              <span><Zap size={14} /> Live profile signals</span>
              <span><Activity size={14} /> Full audit trail</span>
            </div>
          </div>

          <div className="auth-card glass-card">
            <div className="auth-card-top">
              <div className="mini-icon"><ShieldCheck size={20} /></div>
              <div>
                <div className="eyebrow">{register ? "CREATE YOUR PROFILE" : "SECURE ACCESS"}</div>
                <h2>{register ? "Start your risk profile" : "Welcome back"}</h2>
              </div>
            </div>

            <p className="muted">
              {register
                ? "Create an account and begin collecting the signals that power your profile."
                : "Sign in to continue to your personal risk intelligence workspace."}
            </p>

            {error && <div className="error-banner"><X size={15} /> {error}</div>}

            <form onSubmit={submit} className="auth-form">
              {register && (
                <label>Full name
                  <input
                    autoComplete="name" required value={form.full_name}
                    placeholder="Enter your full name"
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </label>
              )}
              <label>Email address
                <input
                  type="email" autoComplete="email" required value={form.email}
                  placeholder="you@example.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>Password
                <input
                  type="password" autoComplete={register ? "new-password" : "current-password"}
                  required minLength="6" value={form.password}
                  placeholder="Minimum 6 characters"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>

              <button className="primary-btn full" disabled={loading}>
                {loading ? <><RefreshCw className="spin" size={16} /> Processing...</> :
                  <>{register ? "Create secure account" : "Enter workspace"} <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="switch">
              {register ? "Already have an account?" : "New to RiskIntel?"}
              <Link to={register ? "/login" : "/register"}>
                {register ? " Sign in" : " Create an account"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const navGroups = [
  { title: "", items: [
    ["/dashboard", "Dashboard", LayoutDashboard],
    ["/profile", "Data Collection", UserRound],
    ["/activity", "Activity History", History]
  ]},
  { title: "", items: [
    ["/forecasting/financial", "Financial Intelligence", CircleDollarSign],
    ["/forecasting/health", "Health & Wellness", HeartPulse],
    ["/forecasting/productivity", "Productivity & Habits", Target],
    ["/forecasting/risk", "Risk Overview", ShieldCheck],
    ["/simulation", "What-If Simulation", LineChart]
  ]},
  { title: "", items: [
    ["/milestone3/simulation", "Simulation Engine", LineChart],
    ["/milestone3/decision", "Decision Analysis", GitCompare],
    ["/milestone3/exploration", "Exploratory Analysis", BarChart3],
    ["/milestone3/recommendations", "Recommendations", Sparkles],
    ["/milestone3/purchases", "Scenario Analysis", WalletCards],
    ["/milestone3/highlights", "Project Highlights", Sparkles]
  ]}
];


function RiskIntelChatbot() {
  const [open,setOpen]=useState(false);
  const [maximized,setMaximized]=useState(false);
  const [name,setName]=useState(localStorage.getItem('riskintel_chatbot_name')||'RiskBot');
  const [editing,setEditing]=useState(false);
  const [input,setInput]=useState('');
  const [historyOpen,setHistoryOpen]=useState(false);
  const [history,setHistory]=useState(()=>JSON.parse(localStorage.getItem('riskintel_chat_history')||'[]'));
  const [voiceEnabled,setVoiceEnabled]=useState(localStorage.getItem('riskintel_voice_enabled')!=='0');
  const [messages,setMessages]=useState([{role:'assistant',text:`Hi! I’m ${name}. I run a local AI model in your browser, so no OpenAI or Gemini key is needed. Ask me anything.`}]);
  const [loading,setLoading]=useState(false);
  const [listening,setListening]=useState(false);

  useEffect(()=>{
    const sync=()=>setVoiceEnabled(localStorage.getItem('riskintel_voice_enabled')!=='0');
    window.addEventListener('riskintel-settings-changed',sync);
    return ()=>window.removeEventListener('riskintel-settings-changed',sync);
  },[]);

  function saveName(){
    const clean=name.trim().slice(0,40)||'RiskBot';
    setName(clean); localStorage.setItem('riskintel_chatbot_name',clean); setEditing(false);
    setMessages(m=>[...m,{role:'assistant',text:`My name is now ${clean}. How can I help?`}]);
  }
  function speak(text){
    if(!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.rate=.96; u.pitch=1.05;
    const voices=window.speechSynthesis.getVoices();
    const female=voices.find(v=>/female|samantha|zira|heera|google uk english female|google us english female|aria|jenny|susan/i.test(v.name));
    if(female) u.voice=female;
    window.speechSynthesis.speak(u);
  }
  function startVoice(){
    if(!voiceEnabled){setMessages(m=>[...m,{role:'assistant',text:'Voice assistant is turned off in Settings. Turn it on to use the microphone and spoken answers.'}]);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setMessages(m=>[...m,{role:'assistant',text:'Voice input is not supported by this browser. Try Chrome or Edge, or type your question.'}]);return;}
    const r=new SR(); r.lang='en-IN'; r.interimResults=false; r.maxAlternatives=1;
    r.onstart=()=>setListening(true); r.onend=()=>setListening(false); r.onerror=()=>setListening(false);
    r.onresult=e=>{const text=e.results[0][0].transcript;setInput(text);}; r.start();
  }
  function saveHistory(q){
    const next=[q,...history.filter(x=>x!==q)].slice(0,30); setHistory(next); localStorage.setItem('riskintel_chat_history',JSON.stringify(next));
  }
  function clearHistory(){setHistory([]);localStorage.removeItem('riskintel_chat_history');}
  function useHistory(q){setInput(q);setHistoryOpen(false);}
  async function ask(e){
    e?.preventDefault(); const q=input.trim(); if(!q||loading)return;
    const previousMessages=[...messages];
    setMessages(m=>[...m,{role:'user',text:q}]); setInput(''); saveHistory(q); setLoading(true);
    try{
      if(!isLocalAIAvailable()){
        throw new Error('Local AI needs WebGPU. Please use the latest Chrome or Edge with hardware acceleration enabled.');
      }
      const answer=await localAIAnswer(q, previousMessages, (progress)=>{
        if(progress) setLoading(true);
      });
      setMessages(m=>[...m,{role:'assistant',text:answer}]); speak(answer);
    }catch(err){
      const detail=err?.message||'The local AI model could not be loaded.';
      setMessages(m=>[...m,{role:'assistant',text:`${detail}\n\nNo OpenAI or Gemini API key is required. On the first use, the local model must download to your browser cache.`}]);
    }finally{setLoading(false)}
  }
  return <>
    <button className="chat-fab" onClick={()=>setOpen(!open)} aria-label="Open AI assistant"><Sparkles size={20}/><span>{name}</span></button>
    {open&&<div className={`chat-panel ${maximized?'maximized':''}`}>
      <div className="chat-head"><div><div className="eyebrow">RISKINTEL AI ASSISTANT</div>{editing?<div className="chat-name-edit"><input value={name} onChange={e=>setName(e.target.value)} autoFocus/><button onClick={saveName}>Save</button></div>:<h3>{name}</h3>}<small>Local AI • No API key • Text + voice</small></div><div className="chat-head-actions"><button className="chat-icon-btn" onClick={()=>setMaximized(!maximized)} title={maximized?'Minimize':'Maximize'}>{maximized?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button><button className="chat-close" onClick={()=>setOpen(false)}>×</button></div></div>
      <div className="chat-toolbar"><button onClick={()=>setEditing(!editing)}>Change name</button><button onClick={()=>setHistoryOpen(!historyOpen)}><History size={11}/> Search history</button><button onClick={()=>setMessages([{role:'assistant',text:`Hi! I’m ${name}. Ask me anything.`}])}>Clear chat</button></div>
      {historyOpen&&<div className="chat-history"><div className="chat-history-head"><b>Search history</b><button onClick={clearHistory} title="Clear search history"><Trash2 size={13}/></button></div>{history.length?history.map((q,i)=><button key={i} onClick={()=>useHistory(q)}>{q}</button>):<span>No questions searched yet.</span>}</div>}
      <div className="chat-messages">{messages.map((m,i)=><div className={`chat-bubble ${m.role}`} key={i}>{m.text}</div>)}{loading&&<div className="chat-bubble assistant">Loading local AI / thinking…</div>}</div>
      <form className="chat-input-row" onSubmit={ask}><button type="button" className={listening?'voice-btn active':'voice-btn'} onClick={startVoice} title={voiceEnabled?'Ask by voice':'Voice assistant is off'}>{voiceEnabled?(listening?'●':'🎙'):'🔇'}</button><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything…"/><button className="chat-send" disabled={loading}>Send</button></form>
    </div>}
  </>
}

function Shell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand"><Brand /></div>
        <div className="product-label">VIRTUAL RISK & COMPLIANCE</div>

        <nav className="side-nav grouped-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              {group.title && <div className="nav-group-title">{group.title}</div>}
              {group.items.map(([path, name, Icon]) => {
                const active = location.pathname === path || (path === "/forecasting/financial" && location.pathname === "/forecasting");
                return (
                  <Link key={path} onClick={() => setMobileOpen(false)}
                    className={active ? "active" : ""} to={path}>
                    <Icon size={17} /><span>{name}</span>
                    {active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="side-bottom">
          <Link className={`sidebar-settings ${location.pathname === "/settings" ? "active" : ""}`}
            to="/settings" onClick={() => setMobileOpen(false)}>
            <Settings2 size={17} /><span>Settings</span>
            {location.pathname === "/settings" && <ChevronRight size={14} />}
          </Link>
          <div className="security-chip">
            <div className="status-dot" />
            <div><b>System protected</b><small>Session encrypted</small></div>
          </div>
          <div className="user-card">
            <div className="avatar">{(user.full_name || "U").charAt(0).toUpperCase()}</div>
            <div className="user-copy"><b>{user.full_name || "User"}</b><small>{user.email}</small></div>
          </div>
          <button className="logout-btn" onClick={logout}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <RiskIntelChatbot />
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div>
            <div className="eyebrow">RISKINTEL AI</div>
            <h2>{location.pathname.includes("milestone3") ? "Digital Twin Simulation Engine" : (location.pathname.includes("forecasting") || location.pathname.includes("simulation") ? "Forecasting & Predictive Analytics" : "Data Collection & User Profiling")}</h2>
          </div>
          <div className="online"><span /> System online</div>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function ProgressRing({ value }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="progress-ring">
      <svg viewBox="0 0 132 132">
        <circle className="ring-track" cx="66" cy="66" r={radius} />
        <circle className="ring-value" cx="66" cy="66" r={radius}
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="ring-label"><strong>{value}</strong><span>/ 100</span></div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try { setData((await api.get("/dashboard")).data); }
    catch (e) { setError(e.response?.data?.detail || "Could not load dashboard."); }
  }

  useEffect(() => { load(); }, []);

  if (error) return <div className="error-banner"><X size={15} /> {error}</div>;
  if (!data) return <Loading />;

  const profile = data.profile || {};
  const populated = [
    profile.age, profile.occupation, profile.monthly_income, profile.monthly_expense,
    profile.savings_goal, profile.study_hours, profile.assignments_pending,
    profile.sleep_hours, profile.exercise_days, profile.screen_hours
  ].filter(v => v !== null && v !== undefined && v !== "" && Number(v) !== 0).length;
  const completion = Math.round((populated / 10) * 100);

  return (
    <>
      <PageIntro
        eyebrow="PERSONAL COMMAND CENTER"
        title={`Good to see you, ${data.user.full_name.split(" ")[0]}.`}
        description="Your latest profile signals, risk indicators and system activity in one view."
        action={<Link className="secondary-btn" to="/profile">Update profile <ArrowRight size={15} /></Link>}
      />

      <div className="hero-dashboard">
        <div className="hero-copy">
          <div className="eyebrow light"><Sparkles size={14} /> INTELLIGENT RISK SNAPSHOT</div>
          <h2>Your current risk posture</h2>
          <p>Calculated from the latest financial, study and habit signals stored in your profile.</p>
          <div className="hero-tags">
            <span><CheckCircle2 size={14} /> Profile monitored</span>
            <span><Clock3 size={14} /> Live data</span>
          </div>
        </div>
        <div className="risk-score-wrap">
          <ProgressRing value={data.risk_score} />
          <div><span className="risk-label">OVERALL RISK</span><strong>{data.risk_level}</strong></div>
        </div>
      </div>

      <div className="section-heading"><div><span>PROFILE HEALTH</span><h3>Signal quality</h3></div><Link to="/profile">Manage data <ArrowRight size={14} /></Link></div>

      <div className="metrics-grid">
        {[
          [CircleDollarSign, "Financial health", data.financial_health, "Income vs. expenses"],
          [BookOpen, "Study health", data.study_health, "Study & pending work"],
          [Moon, "Habit health", data.habit_health, "Sleep, exercise & screen"]
        ].map(([Icon, title, value, sub]) => (
          <div className="metric-card" key={title}>
            <div className="metric-icon"><Icon size={18} /></div>
            <div className="metric-meta"><span>{title}</span><small>{sub}</small></div>
            <strong>{value}%</strong>
            <div className="meter"><span style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel alerts-panel">
          <div className="panel-title"><div><span>ATTENTION</span><h3>Risk signals</h3></div><Target size={19} /></div>
          {data.alerts.map((alert, i) => (
            <div className="alert-item" key={i}><div className="alert-dot" /><span>{alert}</span></div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-title"><div><span>RECENT EVENTS</span><h3>Activity</h3></div><Link to="/activity">View all</Link></div>
          {data.recent_activity.slice(0, 5).map(a => (
            <div className="activity-row" key={a.id}>
              <div className="activity-icon"><Activity size={15} /></div>
              <div><b>{a.action}</b><small>{a.details || a.category} • {new Date(a.created_at).toLocaleString()}</small></div>
            </div>
          ))}
          {!data.recent_activity.length && <Empty text="Your activity will appear here." />}
        </div>
      </div>

      <div className="data-foundation">
        <div className="foundation-icon"><FileCheck2 size={22} /></div>
        <div>
          <div className="eyebrow">DATA FOUNDATION</div>
          <h3>Your profile is the input layer for future AI risk analysis.</h3>
          <p>Signals collected from your financial, study and habit sections are linked to your authenticated account and can be analyzed in the next milestone.</p>
        </div>
        <div className="completion"><strong>{completion}%</strong><span>profile completeness</span></div>
      </div>
    </>
  );
}

const initialProfile = {
  age: "", occupation: "", monthly_income: 0, monthly_expense: 0, savings_goal: 0,
  study_hours: 0, assignments_pending: 0, sleep_hours: 0, exercise_days: 0, screen_hours: 0
};

const sections = {
  finance: {
    label: "Financial profile", icon: WalletCards,
    description: "Capture financial signals used to understand financial resilience.",
    fields: [
      ["Age", "age", "number", "e.g. 21"], ["Occupation / status", "occupation", "text", "e.g. Student"],
      ["Monthly income (₹)", "monthly_income", "number", "0"], ["Monthly expense (₹)", "monthly_expense", "number", "0"],
      ["Monthly savings goal (₹)", "savings_goal", "number", "0"]
    ]
  },
  study: {
    label: "Study profile", icon: BookOpen,
    description: "Capture study and workload signals for productivity risk.",
    fields: [
      ["Study hours / day", "study_hours", "number", "e.g. 5"], ["Assignments pending", "assignments_pending", "number", "e.g. 2"]
    ]
  },
  habits: {
    label: "Habit profile", icon: Moon,
    description: "Capture lifestyle signals such as sleep, exercise and screen time.",
    fields: [
      ["Sleep hours / day", "sleep_hours", "number", "e.g. 7"], ["Exercise days / week", "exercise_days", "number", "e.g. 3"],
      ["Screen hours / day", "screen_hours", "number", "e.g. 6"]
    ]
  }
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState("finance");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/profile"), api.get("/activity")]).then(([profileRes, activityRes]) => {
      setProfile({ ...initialProfile, ...profileRes.data, age: profileRes.data.age ?? "", occupation: profileRes.data.occupation ?? "" });
      setActivities(activityRes.data || []);
    }).catch(() => {});
  }, []);

  const completion = useMemo(() => {
    const values = Object.entries(profile).filter(([k]) => k !== "id" && k !== "user_id" && k !== "updated_at");
    const filled = values.filter(([,v]) => v !== "" && v !== null && v !== undefined && Number(v) !== 0).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const setField = (key, value) => setProfile({ ...profile, [key]: value });

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMessage("");
    try {
      const numericKeys = ["age", "monthly_income", "monthly_expense", "savings_goal",
        "study_hours", "assignments_pending", "sleep_hours", "exercise_days", "screen_hours"];
      const payload = { ...profile };
      numericKeys.forEach(k => {
        if (k === "age" && payload[k] === "") payload[k] = null;
        else payload[k] = Number(payload[k] || 0);
      });
      delete payload.id; delete payload.user_id; delete payload.updated_at;
      await api.put("/profile", payload);
      const [profileRes, activityRes] = await Promise.all([api.get("/profile"), api.get("/activity")]);
      setProfile({ ...initialProfile, ...profileRes.data, age: profileRes.data.age ?? "", occupation: profileRes.data.occupation ?? "" });
      setActivities(activityRes.data || []);
      setMessage("Saved successfully — your profile and stored data are up to date.");
      setTimeout(() => setMessage(""), 4500);
    } catch (e) {
      setMessage(e.response?.data?.detail || "Unable to save profile.");
    } finally { setSaving(false); }
  }

  const current = sections[tab];
  const Icon = current.icon;

  return (
    <>
      <PageIntro
        eyebrow="DATA COLLECTION CENTER"
        title="Build your personal risk profile"
        description="Your information is collected in structured sections, linked to your account, and stored by the backend for future AI analysis."
      />

      <div className="collection-layout">
        <div className="collection-main">
          <div className="section-tabs">
            {Object.entries(sections).map(([key, item]) => {
              const TabIcon = item.icon;
              return <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>
                <TabIcon size={16} /><span>{item.label}</span><ChevronRight size={14} />
              </button>;
            })}
          </div>

          <form className="panel form-panel" onSubmit={save}>
            <div className="form-heading">
              <div className="form-icon"><Icon size={19} /></div>
              <div><div className="eyebrow">{tab.toUpperCase()} SIGNALS</div><h3>{current.label}</h3><p>{current.description}</p></div>
            </div>

            <div className="field-grid">
              {current.fields.map(([label, key, type, placeholder]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    type={type} step={type === "number" ? "0.5" : undefined}
                    min={type === "number" ? "0" : undefined}
                    value={profile[key]}
                    placeholder={placeholder}
                    onChange={e => setField(key, e.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="form-footer">
              <div className="save-status"><span className="secure-dot" /> Stored against your authenticated user</div>
              <button className="primary-btn" disabled={saving}>
                {saving ? <><RefreshCw className="spin" size={15} /> Saving...</> : <><Check size={15} /> Save {tab} data</>}
              </button>
            </div>
            {message && <div className={message.includes("Unable") ? "error-banner" : "success-banner"}><CheckCircle2 size={16} /> {message}</div>}
          </form>
        </div>

        <aside className="collection-side">
          <div className="panel progress-card">
            <div className="eyebrow">PROFILE COMPLETENESS</div>
            <ProgressRing value={completion} />
            <h3>{completion === 100 ? "Profile complete" : "Keep building your profile"}</h3>
            <p>The more structured signals you provide, the stronger the future risk analysis can become.</p>
            <div className="check-list">
              <div className={profile.age || profile.occupation ? "done" : ""}><span>{profile.age || profile.occupation ? "✓" : "1"}</span> Personal context</div>
              <div className={profile.monthly_income || profile.monthly_expense ? "done" : ""}><span>{profile.monthly_income || profile.monthly_expense ? "✓" : "2"}</span> Financial signals</div>
              <div className={profile.study_hours ? "done" : ""}><span>{profile.study_hours ? "✓" : "3"}</span> Study signals</div>
              <div className={profile.sleep_hours || profile.screen_hours ? "done" : ""}><span>{profile.sleep_hours || profile.screen_hours ? "✓" : "4"}</span> Habit signals</div>
            </div>
          </div>

          <div className="panel privacy-card">
            <ShieldCheck size={18} />
            <div><b>Data handling</b><p>Submitted data is sent to the FastAPI backend and stored with your user account. Passwords are hashed before storage.</p></div>
          </div>
        </aside>
      </div>


      <div className="stored-section">
        <div className="stored-section-head">
          <div><div className="eyebrow">CURRENT ACCOUNT RECORD</div><h2>Stored profile data</h2><p>These are the values currently saved for your account.</p></div>
          <div className="last-updated"><Clock3 size={17} /><div><span>LAST PROFILE UPDATE</span><strong>{formatDate(profile.updated_at)}</strong></div></div>
        </div>
        <div className="stored-grid">
          <StoredDataCard title="Personal information" keys={["age", "occupation"]} profile={profile} />
          <StoredDataCard title="Financial information" keys={["monthly_income", "monthly_expense", "savings_goal"]} profile={profile} />
          <StoredDataCard title="Study information" keys={["study_hours", "assignments_pending"]} profile={profile} />
          <StoredDataCard title="Habit information" keys={["sleep_hours", "exercise_days", "screen_hours"]} profile={profile} />
        </div>
        <ProfileChangeHistory items={activities} />
      </div>
    </>
  );
}


const fieldLabels = {
  age: "Age", occupation: "Occupation / status", monthly_income: "Monthly income", monthly_expense: "Monthly expense",
  savings_goal: "Monthly savings goal", study_hours: "Study hours / day", assignments_pending: "Assignments pending",
  sleep_hours: "Sleep hours / day", exercise_days: "Exercise days / week", screen_hours: "Screen hours / day"
};
const moneyFields = new Set(["monthly_income", "monthly_expense", "savings_goal"]);
function formatValue(key, value) {
  if (value === null || value === undefined || value === "" || Number(value) === 0) return "Not provided";
  if (moneyFields.has(key)) return `₹${Number(value).toLocaleString("en-IN")}`;
  if (["study_hours", "sleep_hours", "screen_hours"].includes(key)) return `${value} hrs`;
  if (key === "exercise_days") return `${value} days/week`;
  return String(value);
}
function formatDate(value) {
  if (!value) return "Not updated yet";
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function StoredDataCard({ title, keys, profile }) {
  return <div className="stored-card">
    <div className="stored-card-head"><div><span>STORED DATA</span><h3>{title}</h3></div><ShieldCheck size={18} /></div>
    <div className="stored-list">
      {keys.map(key => <div className="stored-row" key={key}><span>{fieldLabels[key]}</span><strong>{formatValue(key, profile[key])}</strong></div>)}
    </div>
  </div>;
}
function ProfileChangeHistory({ items }) {
  const profileItems = items.filter(x => x.category === "profile").slice(0, 8);
  return <div className="panel profile-history">
    <div className="panel-title"><div><span>PROFILE CHANGES</span><h3>Change history</h3></div><History size={18} /></div>
    {!profileItems.length ? <Empty text="No profile changes recorded yet." /> : <div className="change-list">
      {profileItems.map(item => {
        let changes = [];
        try { changes = JSON.parse(item.details || "[]"); } catch { changes = []; }
        return <div className="change-item" key={item.id}>
          <div className="change-icon"><Check size={14} /></div>
          <div className="change-body"><div className="change-top"><b>Profile updated</b><small>{formatDate(item.created_at)}</small></div>
            {changes.length ? changes.map((c,i) => <div className="change-detail" key={i}><span>{fieldLabels[c.field] || c.field}</span><span><em>{formatValue(c.field, c.old)}</em> → <strong>{formatValue(c.field, c.new)}</strong></span></div>) : <p>Profile information was updated.</p>}
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

function ActivityPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setItems((await api.get("/activity")).data); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <PageIntro
        eyebrow="TRANSPARENT AUDIT TRAIL"
        title="Activity history"
        description="A chronological record of important authentication and profile events associated with your account."
        action={<button className="secondary-btn" onClick={load}><RefreshCw size={15} /> Refresh</button>}
      />
      <div className="activity-layout">
        <div className="panel timeline-panel">
          <div className="panel-title"><div><span>ACCOUNT EVENTS</span><h3>Recent activity</h3></div><History size={19} /></div>
          {loading ? <Loading /> : items.length ? (
            <div className="timeline">
              {items.map((item, i) => (
                <div className="timeline-item" key={item.id}>
                  <div className="timeline-line"><div className="timeline-dot"><Activity size={13} /></div></div>
                  <div className="timeline-content">
                    <div className="event-top"><b>{item.action}</b><span>{item.category}</span></div>
                    <p>{item.details || "System activity recorded."}</p>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty text="No activity recorded yet." />}
        </div>
        <div className="panel audit-summary">
          <div className="summary-icon"><FileCheck2 size={20} /></div>
          <div className="eyebrow">AUDIT READY</div>
          <h3>Your activity is traceable.</h3>
          <p>Each event is associated with your authenticated user ID, giving the system a clear audit trail for future compliance workflows.</p>
          <div className="summary-stat"><strong>{items.length}</strong><span>events recorded</span></div>
          <div className="summary-stat"><strong>100%</strong><span>user-linked</span></div>
        </div>
      </div>
    </>
  );
}

function SettingsPage() {
  const user = getUser();
  const navigate = useNavigate();
  const [compact, setCompact] = useState(localStorage.getItem("riskintel_compact") === "1");
  const [notifications, setNotifications] = useState(localStorage.getItem("riskintel_notifications") !== "0");
  const [voiceEnabled, setVoiceEnabled] = useState(localStorage.getItem("riskintel_voice_enabled") !== "0");
  const [nightMode, setNightMode] = useState(localStorage.getItem("riskintel_theme") === "night");

  function broadcast(){window.dispatchEvent(new Event('riskintel-settings-changed'));}
  function toggleCompact(value) { setCompact(value); localStorage.setItem("riskintel_compact", value ? "1" : "0"); document.body.classList.toggle("compact-mode", value); }
  function toggleNotifications(value) { setNotifications(value); localStorage.setItem("riskintel_notifications", value ? "1" : "0"); }
  function toggleVoice(value) { setVoiceEnabled(value); localStorage.setItem("riskintel_voice_enabled", value ? "1" : "0"); if(!value&&'speechSynthesis' in window) window.speechSynthesis.cancel(); broadcast(); }
  function toggleNight(value) { setNightMode(value); localStorage.setItem("riskintel_theme", value ? "night" : "day"); document.body.classList.toggle("night-mode", value); broadcast(); }
  function logout() { localStorage.clear(); navigate("/login"); }

  return <>
    <PageIntro eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Manage your RiskIntel workspace, theme and voice assistant preferences." />
    <div className="settings-grid">
      <div className="panel settings-card"><div className="panel-title"><div><span>ACCOUNT</span><h3>Account information</h3></div><UserRound size={19}/></div><div className="settings-profile"><div className="settings-avatar">{(user.full_name||"U").charAt(0).toUpperCase()}</div><div><b>{user.full_name||"User"}</b><p>{user.email||"No email available"}</p></div></div><div className="setting-row"><div><b>Session security</b><p>Your authenticated session is active.</p></div><span className="settings-badge">Protected</span></div></div>
      <div className="panel settings-card"><div className="panel-title"><div><span>APPEARANCE</span><h3>Day / night mode</h3></div>{nightMode?<MoonIcon size={19}/>:<Sun size={19}/>}</div><div className="setting-row"><div><b>{nightMode?'Night mode':'Day mode'}</b><p>Switch the complete workspace between light and dark appearance.</p></div><button className={`toggle ${nightMode?'on':''}`} onClick={()=>toggleNight(!nightMode)} aria-label="Toggle day night mode"><span/></button></div></div>
      <div className="panel settings-card"><div className="panel-title"><div><span>VOICE</span><h3>Voice assistant</h3></div>{voiceEnabled?<Volume2 size={19}/>:<VolumeX size={19}/>}</div><div className="setting-row"><div><b>Voice assistant {voiceEnabled?'on':'off'}</b><p>Controls microphone input and spoken chatbot answers. The assistant prefers a female browser voice when available.</p></div><button className={`toggle ${voiceEnabled?'on':''}`} onClick={()=>toggleVoice(!voiceEnabled)} aria-label="Toggle voice assistant"><span/></button></div></div>
      <div className="panel settings-card"><div className="panel-title"><div><span>INTERFACE</span><h3>Workspace preferences</h3></div><Settings2 size={19}/></div><div className="setting-row"><div><b>Compact workspace</b><p>Reduce spacing across the dashboard for more content on screen.</p></div><button className={`toggle ${compact?'on':''}`} onClick={()=>toggleCompact(!compact)} aria-label="Toggle compact workspace"><span/></button></div><div className="setting-row"><div><b>Activity notifications</b><p>Keep activity and system updates enabled for this workspace.</p></div><button className={`toggle ${notifications?'on':''}`} onClick={()=>toggleNotifications(!notifications)} aria-label="Toggle notifications"><span/></button></div></div>
      <div className="panel settings-card danger-settings"><div className="panel-title"><div><span>SESSION</span><h3>Sign out</h3></div><LogOut size={19}/></div><p>Sign out from this RiskIntel account on this browser. Your saved profile and project data are not deleted.</p><button className="logout-large" onClick={logout}><LogOut size={16}/> Sign out of RiskIntel</button></div>
    </div>
  </>
}

function Loading() {
  return <div className="loading-card"><RefreshCw className="spin" size={18} /> Loading secure workspace...</div>;
}
function Empty({ text }) { return <div className="empty"><Activity size={18} /><span>{text}</span></div>; }
function Protected({ children }) { return localStorage.getItem("riskintel_token") ? children : <Navigate to="/login" replace />; }


class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    console.error("RiskIntel frontend error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"Arial,sans-serif",background:"#f6f7fb"}}>
          <div style={{maxWidth:620,width:"100%",background:"white",border:"1px solid #e5e7eb",borderRadius:18,padding:28,boxShadow:"0 15px 45px rgba(0,0,0,.08)"}}>
            <h2 style={{marginTop:0,color:"#17132f"}}>RiskIntel AI could not render this section</h2>
            <p style={{color:"#5b6070",lineHeight:1.6}}>The page has been protected from a blank white screen. Refresh the page after restarting the frontend. If the problem continues, check the browser console for the exact error.</p>
            <button onClick={() => window.location.reload()} style={{border:0,borderRadius:10,padding:"11px 16px",background:"#6547e8",color:"white",fontWeight:700,cursor:"pointer"}}>Refresh page</button>
            <pre style={{marginTop:18,whiteSpace:"pre-wrap",color:"#b42318",fontSize:12}}>{String(this.state.error?.message || this.state.error || "Unknown error")}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  useEffect(()=>{ document.body.classList.toggle("night-mode", localStorage.getItem("riskintel_theme") === "night"); document.body.classList.toggle("compact-mode", localStorage.getItem("riskintel_compact") === "1"); },[]);
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><Shell><Dashboard /></Shell></Protected>} />
      <Route path="/profile" element={<Protected><Shell><Profile /></Shell></Protected>} />
      <Route path="/activity" element={<Protected><Shell><ActivityPage /></Shell></Protected>} />
      <Route path="/settings" element={<Protected><Shell><SettingsPage /></Shell></Protected>} />
      <Route path="/forecasting" element={<Protected><Shell><Forecasting /></Shell></Protected>} />
      <Route path="/forecasting/:section" element={<Protected><Shell><Forecasting /></Shell></Protected>} />
      <Route path="/simulation" element={<Protected><Shell><Simulation /></Shell></Protected>} />
      <Route path="/milestone3" element={<Protected><Shell><DigitalTwin /></Shell></Protected>} />
      <Route path="/milestone3/:section" element={<Protected><Shell><DigitalTwin /></Shell></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter><AppErrorBoundary><App /></AppErrorBoundary></BrowserRouter>
);
