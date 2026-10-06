import React,{useEffect,useMemo,useState} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {Activity,BarChart3,BookOpen,BrainCircuit,CalendarDays,Check,CircleDollarSign,Clock3,HeartPulse,LineChart,MonitorSmartphone,RefreshCw,Save,ShieldCheck,Sparkles,Target,TrendingDown,TrendingUp,WalletCards} from 'lucide-react';
import axios from 'axios';

const api=axios.create({baseURL:import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('riskintel_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});

const money=['income','rent','shopping','food','healthcare','taxes','installment','transport','education','entertainment','other','savings'];
const initial={income:50000,rent:12000,shopping:6000,food:4500,healthcare:1800,taxes:2000,installment:3500,transport:2200,education:1200,entertainment:1200,other:900,savings:12700,study_hours:5,work_hours:7,screen_hours:6,sleep_hours:7,exercise_days:4,tasks_completed:8,productivity_score:78,energy_level:72,mood:'Calm'};
const labels={income:'Monthly income',rent:'Rent',shopping:'Shopping',food:'Food',healthcare:'Healthcare',taxes:'Taxes',installment:'Installments / EMI',transport:'Transport',education:'Education',entertainment:'Entertainment',other:'Other',savings:'Current savings',study_hours:'Study hours / day',work_hours:'Work hours / day',screen_hours:'Screen time / day',sleep_hours:'Sleep hours / day',exercise_days:'Exercise days / week',tasks_completed:'Tasks completed / week',productivity_score:'Productivity score',energy_level:'Energy level'};
const horizonMeta={day:{label:'Next day',short:'1 day'},week:{label:'Next 7 days',short:'7 days'},month:{label:'Next month',short:'1 month'}};

function moneyFmt(v){return `₹${Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`}
function Field({label,value,set}){return <label className="field"><span>{label}</span><input type="number" min="0" step="0.1" value={value} onChange={e=>set(e.target.value)}/></label>}
function Metric({label,value,icon:Icon,trend}){return <div className="signal-row"><div className="signal-icon"><Icon size={14}/></div><div><span>{label}</span><b>{value}</b></div>{trend&&<em>{trend}</em>}</div>}
function SectionTitle({kicker,title,icon:Icon,action}){return <div className="m2-card-head"><div><span className="card-kicker">{kicker}</span><h3>{Icon&&<Icon size={16}/>} {title}</h3></div>{action}</div>}

const chartColors=['#5b4bdb','#19a974','#f59e0b','#e05d7a'];
function LineChartSvg({rows,lines,height=230,currency=false}){
 const w=820,h=height,p={l:48,r:18,t:22,b:38};
 const vals=lines.flatMap(l=>rows.map(r=>Number(r[l.key]||0))); const max=Math.max(...vals,1), min=Math.min(0,...vals);
 const x=i=>p.l+(rows.length===1?0:(i*(w-p.l-p.r)/(rows.length-1)));
 const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min||1);
 return <div className="svg-chart"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trend chart">
   {[0,.25,.5,.75,1].map((t,i)=><g key={i}><line x1={p.l} x2={w-p.r} y1={p.t+t*(h-p.t-p.b)} y2={p.t+t*(h-p.t-p.b)} className="chart-grid"/><text x={p.l-8} y={p.t+t*(h-p.t-p.b)+4} textAnchor="end" className="chart-axis">{currency?`₹${Math.round((max-(max-min)*t)/1000)}k`:Math.round(max-(max-min)*t)}</text></g>)}
   {lines.map((l,li)=><polyline key={l.key} fill="none" stroke={chartColors[li % chartColors.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={rows.map((r,i)=>`${x(i)},${y(Number(r[l.key]||0))}`).join(' ')}/>)}
   {rows.map((r,i)=><text key={i} x={x(i)} y={h-12} textAnchor="middle" className="chart-axis">{r.label}</text>)}
   {lines.map((l,li)=><g key={'legend'+l.key}><circle cx={p.l+li*145} cy={h-30} r="4" fill={chartColors[li % chartColors.length]}/><text x={p.l+8+li*145} y={h-26} className="chart-legend">{l.label}</text></g>)}
 </svg></div>
}
function BarChartSvg({items,currency=true}){
 const max=Math.max(...items.map(x=>Number(x.value||0)),1);
 return <div className="bar-chart-pro">{items.map((x,i)=><div className="bar-pro-row" key={x.label}><div className="bar-pro-label"><span>{x.label}</span><b>{currency?moneyFmt(x.value):x.value}</b></div><div className="bar-pro-track"><span style={{width:`${Math.max(2,Number(x.value)/max*100)}%`}}/></div></div>)}</div>
}

function DonutChartSvg({items}){
 const total=items.reduce((a,x)=>a+Number(x.value||0),0)||1;
 const colors=['#5b4bdb','#19a974','#f59e0b','#e05d7a','#4b8bd8','#8b5cf6'];
 let offset=0;
 return <div className="donut-wrap"><svg viewBox="0 0 120 120" className="donut">
   <circle cx="60" cy="60" r="42" fill="none" stroke="#eeeef5" strokeWidth="16"/>
   {items.map((x,i)=>{const pct=Number(x.value||0)/total;const dash=pct*263.9;const el=<circle key={x.label} cx="60" cy="60" r="42" fill="none" stroke={colors[i%colors.length]} strokeWidth="16" strokeDasharray={`${dash} ${263.9-dash}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"/>;offset+=dash;return el;})}
   <text x="60" y="56" textAnchor="middle" className="donut-total">{moneyFmt(total)}</text><text x="60" y="69" textAnchor="middle" className="donut-label">forecast</text>
 </svg><div className="donut-legend">{items.slice(0,6).map((x,i)=><div key={x.label}><i style={{background:colors[i%colors.length]}}/><span>{x.label}</span><b>{Math.round(Number(x.value||0)/total*100)}%</b></div>)}</div></div>
}
function riskInfo(score){const n=Math.max(0,Math.min(100,Math.round(score)));return {score:n,label:n>=70?'High Risk':n>=40?'Moderate Risk':'Low Risk',tone:n>=70?'high':n>=40?'medium':'low'};}

function Forecasting(){
 const navigate=useNavigate();
 const location=useLocation();
 const [form,setForm]=useState(initial),[data,setData]=useState(null),[history,setHistory]=useState([]),[trend,setTrend]=useState([]),[explain,setExplain]=useState(null),[horizon,setHorizon]=useState('month'),[saving,setSaving]=useState(false),[msg,setMsg]=useState(''),[loading,setLoading]=useState(true);

 async function load(h=horizon){
   setLoading(true);
   try{
     const [i,f,hist,t,ex]=await Promise.allSettled([api.get('/forecast/inputs'),api.get(`/forecast?horizon=${h}`),api.get(`/forecast/history?horizon=${h}`),api.get(`/forecast/trend?horizon=${h}`),api.get(`/forecast/explain?horizon=${h}`)]);
     if(i.status==='fulfilled')setForm({...initial,...i.value.data});
     if(f.status==='fulfilled')setData(f.value.data);
     if(hist.status==='fulfilled')setHistory(hist.value.data.rows||[]);
     if(t.status==='fulfilled')setTrend(t.value.data.rows||[]);
     if(ex.status==='fulfilled')setExplain(ex.value.data);
     if(f.status==='rejected')throw f.reason;
   }catch(e){setMsg(e.response?.data?.detail||'Start the backend to load forecasting.')}finally{setLoading(false)}
 }
 useEffect(()=>{load(horizon)},[horizon]);
 useEffect(()=>{
   const section=location.pathname.split('/')[2] || 'financial';
   const timer=setTimeout(()=>{
     const el=document.getElementById(section);
     if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
   },100);
   return ()=>clearTimeout(timer);
 },[location.pathname]);
 async function save(){
   setSaving(true);setMsg('');
   try{const payload={...form};Object.keys(payload).forEach(k=>{if(k!=='mood')payload[k]=Number(payload[k]||0)});
     await api.put('/forecast/inputs',payload);await load(horizon);setMsg('Forecast inputs saved and predictions refreshed.');
   }catch(e){setMsg(e.response?.data?.detail||'Unable to save forecasting inputs.')}finally{setSaving(false)}
 }
 const p=data?.prediction;
 const financeRows=useMemo(()=>history.map((r,i)=>({...r,label:new Date(r.period).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})})),[history]);
 const catItems=(p?.categories||[]).slice(0,10).map(x=>({label:x.category,value:x.amount}));
 const studyRows=history.map(r=>({...r,label:new Date(r.period).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}));
 const wellnessRows=history.map(r=>({...r,label:new Date(r.period).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}));
 const financialRisk=riskInfo((Math.max(0,Number(form.income)-Number(form.savings))/Math.max(1,Number(form.income))*55)+((Number(form.installment)+Number(form.rent)+Number(form.taxes))/Math.max(1,Number(form.income))*45));
 const wellnessIndex=Math.round(Math.max(0,Math.min(100, (Math.min(100,Number(form.sleep_hours)/8*40)) + (Math.min(100,Number(form.exercise_days)/5*20)) + (Math.min(100,Number(form.energy_level))*0.25) + (Math.max(0,100-Math.min(100,Number(form.screen_hours)/10*100))*0.15) )));
 const healthRisk=riskInfo(100-wellnessIndex);
 const productivityRisk=riskInfo(100-((Math.min(100,Number(form.productivity_score))*.6)+(Math.min(100,Number(form.tasks_completed)*10)*.2)+(Math.min(100,Number(form.study_hours)*10)*.2)));
 const overallRisk=riskInfo((financialRisk.score+healthRisk.score+productivityRisk.score)/3);
 const riskCards=[{title:'Financial Risk',score:financialRisk.score,info:financialRisk,icon:CircleDollarSign,detail:'Expense burden, savings and fixed-cost exposure.'},{title:'Health & Wellness Risk',score:healthRisk.score,info:healthRisk,icon:HeartPulse,detail:'Non-medical lifestyle signal from sleep, exercise, energy and screen time.'},{title:'Productivity & Habit Risk',score:productivityRisk.score,info:productivityRisk,icon:Target,detail:'Behavioral signal from productivity, tasks and study consistency.'}];
 if(loading&&!data)return <Loading/>;

 return <>
  <div className="m2-banner premium-banner"><div><div className="eyebrow"><Sparkles size={13}/> FORECASTING LAB</div><h1>Forecasting & Predictive Analytics</h1><p>Financial, study and wellness intelligence with selectable future horizons and transparent historical trends.</p></div><div className="m2-model"><BrainCircuit size={17}/><span><b>XGBoost</b><small>Predictive engine</small></span></div></div>

  <div className="forecast-toolbar">
    <div><span className="card-kicker">FORECAST HORIZON</span><h3><CalendarDays size={17}/> Choose how far ahead</h3></div>
    <div className="horizon-switch">{Object.entries(horizonMeta).map(([key,v])=><button key={key} className={horizon===key?'selected':''} onClick={()=>setHorizon(key)}><b>{v.label}</b><small>{v.short}</small></button>)}</div>
    <button className="secondary-btn" onClick={()=>load(horizon)}><RefreshCw size={14}/> Refresh</button>
  </div>

  <div className="forecast-summary-strip">
    <div className="summary-focus"><span>{horizonMeta[horizon].label} expenditure</span><strong>{p?moneyFmt(p.predicted_total):'—'}</strong><em className={p&&p.change_percent>0?'up':'down'}>{p?(p.change_percent>=0?'+':'')+p.change_percent+'% vs current period':''}</em></div>
    <div><span>Top predicted category</span><b>{p?.top_category||'—'}</b></div>
    <div><span>Forecast confidence</span><b>{p?.confidence||'—'}%</b></div>
    <div><span>Prediction engine</span><b>XGBoost</b></div>
  </div>

  <div id="financial" className="m2-grid anchor-section">
   <section className="m2-card chart-card"><SectionTitle kicker="FINANCE • HISTORICAL + FORECAST" title={`${horizonMeta[horizon].label} financial outlook`} icon={CircleDollarSign} action={<span className="ai-badge">LIVE MODEL</span>}/>
    <div className="chart-kpi-row"><div><small>Current</small><b>{p?moneyFmt(p.current_total):'—'}</b></div><div><small>Predicted</small><b>{p?moneyFmt(p.predicted_total):'—'}</b></div><div><small>Predicted savings</small><b>{p?moneyFmt(p.predicted_savings):'—'}</b></div></div>
    <LineChartSvg rows={financeRows} currency lines={[{key:'current_expenditure',label:'Current spend'},{key:'predicted_expenditure',label:'Predicted spend'}]}/>
    <div className="chart-note"><ShieldCheck size={15}/><span>{history.length>=2&&history[0]?.period? (history.length>=2 && data?.model_info ? 'Historical trend is based on your saved forecast snapshots when available; otherwise it uses the clean 1,000-record training history.' : ''):'Historical trend is prepared from the training dataset until user history is available.'}</span></div>
   </section>

   <section className="m2-card"><SectionTitle kicker="CATEGORY FORECAST" title="Where expenditure is likely to go" icon={BarChart3} action={<span className="ai-badge">AI POWERED</span>}/>
    <div className="top-category-card"><div><span>Highest predicted category</span><strong>{p?.top_category||'—'}</strong></div><Target size={25}/></div>
    <BarChartSvg items={catItems}/>
    <div className="donut-section"><span className="card-kicker">EXPENDITURE MIX</span><h4>Category distribution</h4><DonutChartSvg items={catItems.slice(0,6)}/></div>
    <div className="mini-stat-grid"><div><span>Fixed expense</span><b>{p?moneyFmt(p.fixed_expense):'—'}</b></div><div><span>Variable expense</span><b>{p?moneyFmt(p.variable_expense):'—'}</b></div></div>
   </section>
  </div>

  <div className="m2-grid">
   <section className="m2-card chart-card"><SectionTitle kicker="TIME-SERIES TREND • ARIMA" title="Future expenditure trajectory" icon={TrendingUp} action={<span className="ai-badge">SECONDARY MODEL</span>}/>
    <div className="chart-kpi-row"><div><small>Personalized XGBoost</small><b>{p?moneyFmt(p.xgboost_prediction):'—'}</b><em>{horizonMeta[horizon].label}</em></div><div><small>ARIMA trend signal</small><b>{p?moneyFmt(p.time_series_prediction):'—'}</b><em>population trend</em></div><div><small>Hybrid forecast</small><b>{p?moneyFmt(p.predicted_total):'—'}</b><em>85% XGBoost + 15% trend</em></div></div>
    <LineChartSvg rows={trend.map(r=>({...r,label:new Date(r.period).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}))} currency lines={[{key:'cumulative_expenditure',label:'Cumulative future expenditure'}]}/>
    <div className="chart-note"><TrendingUp size={15}/><span>ARIMA captures the dated dataset trend, while XGBoost personalizes the forecast to the user's financial, study and wellness inputs.</span></div>
   </section>

   <section className="m2-card chart-card"><SectionTitle kicker="EXPLAINABLE AI • SHAP" title="Why this prediction?" icon={BrainCircuit} action={<span className="ai-badge">FEATURE IMPACT</span>}/>
    <div className="explain-summary"><div><span>Explained forecast</span><b>{explain?moneyFmt(explain.base_prediction):'—'}</b></div><small>{explain?.method||'SHAP explanation will appear when the backend is ready.'}</small></div>
    <div className="impact-list">{(explain?.explanations||[]).map(x=><div className="impact-row" key={x.feature}><div><b>{x.feature}</b><span>Current: {x.value}</span></div><div className={x.impact>=0?'impact-positive':'impact-negative'}>{x.impact>=0?'+':''}{Number(x.impact).toFixed(2)}<small>{x.direction}</small></div></div>)}</div>
    {!explain&&<div className="empty-analytics">Start the backend to generate feature-level explanations.</div>}
   </section>
  </div>

  <div className="m2-grid">
   <section id="productivity" className="m2-card chart-card anchor-section"><SectionTitle kicker="STUDY & PRODUCTIVITY • HISTORY" title="Study and productivity trend" icon={BookOpen} action={<span className="ai-badge">TREND</span>}/>
     <div className="chart-kpi-row"><div><small>Study prediction</small><b>{p?.behavioral?`${p.behavioral.study_period} hrs`: '—'}</b><em>{horizon==='day'?'next day':horizon==='week'?'next 7 days':'next month'}</em></div><div><small>Productivity</small><b>{p?.behavioral?.productivity_score||'—'}/100</b></div><div><small>Tasks / week</small><b>{form.tasks_completed}</b></div></div>
     <LineChartSvg rows={studyRows} lines={[{key:'study_hours',label:horizon==='day'?'Daily study':'Study hours'},{key:'productivity_score',label:'Productivity'}]}/>
     <div className="signal-grid"><Metric label="Study hours" value={`${form.study_hours} hrs/day`} icon={Clock3}/><Metric label="Work hours" value={`${form.work_hours} hrs/day`} icon={Activity}/><Metric label="Productivity" value={`${form.productivity_score}/100`} icon={Target}/></div>
   </section>

   <section id="health" className="m2-card chart-card anchor-section"><SectionTitle kicker="HEALTH & WELLNESS • HISTORY" title="Wellness signals" icon={HeartPulse} action={<span className="ai-badge">NON-MEDICAL</span>}/>
     <div className="health-score"><div className="health-score-main"><span>Current wellness index</span><strong>{wellnessIndex}</strong><small>/100 • lifestyle signal</small></div><div className="health-pill"><HeartPulse size={16}/> Self-reported wellness</div></div>
     <LineChartSvg rows={wellnessRows} lines={[{key:'sleep_hours',label:'Sleep hours'},{key:'energy_level',label:'Energy level'}]}/>
     <div className="wellness-mini"><Metric label="Sleep" value={`${form.sleep_hours} hrs/day`} icon={Clock3}/><Metric label="Exercise" value={`${form.exercise_days} days/week`} icon={Activity}/><Metric label="Screen time" value={`${form.screen_hours} hrs/day`} icon={MonitorSmartphone}/></div>
   </section>
  </div>

  <section id="risk" className="m2-card risk-overview anchor-section">
    <SectionTitle kicker="RISK INTELLIGENCE" title="Risk by domain" icon={ShieldCheck} action={<span className="ai-badge">EARLY WARNING</span>}/>
    <div className="overall-risk"><div><span>Overall risk index</span><strong>{overallRisk.score}/100</strong><small>Higher score = higher modeled risk</small></div><div className={`risk-pill ${overallRisk.tone}`}>{overallRisk.label}</div></div>
    <div className="risk-grid">{riskCards.map(({title,score,info,icon:Icon,detail})=><div className={`risk-card ${info.tone}`} key={title}><div className="risk-card-top"><div className="risk-icon"><Icon size={17}/></div><span>{title}</span></div><div className="risk-score"><strong>{score}</strong><small>/100</small></div><div className="risk-track"><span style={{width:`${score}%`}}/></div><b>{info.label}</b><p>{detail}</p></div>)}</div>
    <div className="risk-note"><ShieldCheck size={15}/><span>These are prototype decision-support indicators, not medical diagnoses or guaranteed financial outcomes.</span></div>
  </section>

  <section className="m2-card prediction-detail">
    <SectionTitle kicker="FUTURE SIGNALS" title={`${horizonMeta[horizon].label} behavioral outlook`} icon={TrendingUp}/>
    <div className="future-grid">
      <div><BookOpen size={18}/><span>Study</span><b>{p?.behavioral?.study_period||'—'} hrs</b><small>{horizon==='day'?'tomorrow':horizon==='week'?'across 7 days':'across 30 days'}</small></div>
      <div><HeartPulse size={18}/><span>Sleep</span><b>{p?.behavioral?.sleep_hours||'—'} hrs/day</b><small>predicted lifestyle signal</small></div>
      <div><Target size={18}/><span>Productivity</span><b>{p?.behavioral?.productivity_score||'—'}/100</b><small>next-period signal</small></div>
      <div><Sparkles size={18}/><span>Energy</span><b>{p?.behavioral?.energy_level||'—'}/100</b><small>next-period signal</small></div>
      <div><Activity size={18}/><span>Exercise</span><b>{p?.behavioral?.exercise_period||'—'}</b><small>{horizon==='day'?'days equivalent':horizon==='week'?'days / week':'days / month equivalent'}</small></div>
      <div><MonitorSmartphone size={18}/><span>Screen time</span><b>{form.screen_hours} hrs/day</b><small>current behavioral input</small></div>
    </div>
  </section>

  <section className="m2-card inputs-card"><SectionTitle kicker="CURRENT DATA" title="Financial, study & wellness inputs" icon={WalletCards} action={<button className="secondary-btn" onClick={()=>load(horizon)}><RefreshCw size={14}/> Reload current</button>}/>
    <div className="data-context-row"><div><ShieldCheck size={16}/><span>Stored for the authenticated user</span></div><div><Clock3 size={16}/><span>Forecast refreshes when saved</span></div><div><BrainCircuit size={16}/><span>Same XGBoost engine powers every horizon</span></div></div>
    <div className="input-section-title">Financial condition</div><div className="forecast-input-grid">{money.map(k=><Field key={k} label={labels[k]} value={form[k]} set={v=>setForm({...form,[k]:v})}/>)}</div>
    <div className="input-section-title">Study, work, screen time & wellness</div><div className="forecast-input-grid">{['study_hours','work_hours','screen_hours','sleep_hours','exercise_days','tasks_completed','productivity_score','energy_level'].map(k=><Field key={k} label={labels[k]} value={form[k]} set={v=>setForm({...form,[k]:v})}/>)}</div>
    <div className="input-section-title">Self-reported mood</div><div className="mood-select">{['Happy','Calm','Neutral','Stressed','Sad','Anxious'].map(m=><button type="button" key={m} className={form.mood===m?'selected':''} onClick={()=>setForm({...form,mood:m})}>{m}</button>)}</div>
    <div className="form-footer"><div className="save-status"><span className="secure-dot"/> Current input snapshot</div><button className="primary-btn" onClick={save} disabled={saving}>{saving?<><RefreshCw className="spin" size={15}/> Saving...</>:<><Save size={15}/> Save & refresh forecast</>}</button></div>
    {msg&&<div className={msg.includes('Unable')||msg.includes('backend')?'error-banner':'success-banner'}><Check size={15}/>{msg}</div>}
  </section>

  <div className="model-strip"><div><BrainCircuit size={18}/><div><b>Hybrid Predictive Engine</b><span>XGBoost + ARIMA + SHAP • 1,000 unique, non-null records • 80/20 validation</span></div></div><div><span>MAE</span><b>{p?.metrics?.mae?moneyFmt(p.metrics.mae):'—'}</b></div><div><span>R²</span><b>{p?.metrics?.r2??'—'}</b></div><div><span>Horizons</span><b>1 day • 7 days • 1 month</b></div></div>
 </>;
}

export function Simulation(){
 const navigate=useNavigate(); const [f,setF]=useState(initial),[result,setResult]=useState(null),[horizon,setHorizon]=useState('month'),[busy,setBusy]=useState(false);
 const run=async()=>{setBusy(true);try{const p={...f};Object.keys(p).forEach(k=>{if(k!=='mood')p[k]=Number(p[k]||0)});setResult((await api.post(`/forecast/simulate?horizon=${horizon}`,p)).data)}catch(e){setResult(null)}finally{setBusy(false)}};
 useEffect(()=>{run()},[horizon]);
 return <><div className="page-intro"><div><div className="eyebrow">SCENARIO PLANNING</div><h1>What-If Simulation</h1><p>Test a temporary scenario and compare its forecast without changing the stored user profile.</p></div><button className="secondary-btn" onClick={()=>navigate('/forecasting')}><BarChart3 size={14}/> Back to forecasting</button></div>
 <div className="forecast-toolbar simulation-toolbar"><div><span className="card-kicker">SIMULATION HORIZON</span><h3>Choose prediction period</h3></div><div className="horizon-switch">{Object.entries(horizonMeta).map(([key,v])=><button key={key} className={horizon===key?'selected':''} onClick={()=>setHorizon(key)}><b>{v.label}</b><small>{v.short}</small></button>)}</div></div>
 <div className="simulation-layout"><section className="m2-card"><SectionTitle kicker="TEMPORARY SCENARIO" title="Adjust financial & lifestyle inputs" icon={LineChart}/><div className="forecast-input-grid">{['income','rent','shopping','food','healthcare','taxes','installment','screen_hours','study_hours','work_hours','sleep_hours'].map(k=><Field key={k} label={labels[k]} value={f[k]} set={v=>setF({...f,[k]:v})}/>)}</div><button className="primary-btn" onClick={run} disabled={busy}>{busy?<><RefreshCw className="spin" size={15}/> Running...</>:<><LineChart size={15}/> Run {horizonMeta[horizon].label} simulation</>}</button></section>
 <section className="m2-card simulation-result"><span className="card-kicker">SCENARIO RESULT</span><h2>{result?moneyFmt(result.predicted_total):'₹—'}</h2><p>Predicted expenditure • {horizonMeta[horizon].label}</p>{result&&<><div className="sim-kpis"><div><span>Predicted savings</span><b>{moneyFmt(result.predicted_savings)}</b></div><div><span>Change</span><b>{result.change_percent}%</b></div><div><span>Top category</span><b>{result.top_category}</b></div></div><div className="prediction-callout"><Target size={17}/><div><b>Scenario confidence {result.confidence}%</b><small>This is a model scenario, not a guaranteed outcome.</small></div></div><BarChartSvg items={(result.categories||[]).slice(0,6).map(x=>({label:x.category,value:x.amount}))}/></>}</section></div></>
}
function Loading(){return <div className="loading-card"><RefreshCw className="spin" size={18}/> Loading forecasting workspace...</div>}
export default Forecasting;
