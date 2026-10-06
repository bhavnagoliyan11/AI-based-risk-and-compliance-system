import React,{useEffect,useMemo,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {BarChart3,BrainCircuit,CheckCircle2,Compass,GitCompare,Lightbulb,RefreshCw,TrendingUp,WalletCards,Car,Building2,Smartphone,Laptop,Diamond,Activity,HeartPulse,Clock3,ShoppingBag} from 'lucide-react';
import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://127.0.0.1:8000/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('riskintel_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c});
const money=v=>`₹${Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`;
const risk=v=>Number(v||0)>=70?'high':Number(v||0)>=40?'medium':'low';
function Loading(){return <div className="loading-card"><RefreshCw className="spin" size={18}/> Loading Digital Twin...</div>}
function RiskBadge({value}){return <span className={`risk-pill ${risk(value)}`}>{Math.round(value)} / 100</span>}
function ScenarioBars({rows,keyName,currency=false}){const vals=rows.map(r=>Math.abs(Number(r[keyName]||0)));const max=Math.max(...vals,1);return <div className="dt-bars">{rows.map(r=><div className="dt-bar-row" key={r.scenario}><div><span>{r.scenario==='expected'?'Expected':r.scenario==='best'?'Best':'Risk'}</span><b>{currency?money(r[keyName]):Math.round(r[keyName])}</b></div><div className="dt-track"><span style={{width:`${Math.max(4,Math.abs(Number(r[keyName]||0))/max*100)}%`}}/></div></div>)}</div>}
function LineChart({series=[],height=230,labels=true}){if(!series.length)return <div className="empty-analytics">No chart data available.</div>;const all=series.flatMap(s=>s.values||[]);const min=Math.min(...all,0),max=Math.max(...all,1);const W=620,H=height,pad={l:42,r:18,t:18,b:labels?34:18};const x=i=>pad.l+i*(W-pad.l-pad.r)/Math.max((series[0].values?.length||1)-1,1);const y=v=>pad.t+(max-v)/(max-min||1)*(H-pad.t-pad.b);return <svg className="dt-linechart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><line x1={pad.l} y1={H-pad.b} x2={W-pad.r} y2={H-pad.b}/><line x1={pad.l} y1={pad.t} x2={pad.l} y2={H-pad.b}/>{[0,.25,.5,.75,1].map((q,i)=><line key={i} className="grid-line" x1={pad.l} y1={pad.t+q*(H-pad.t-pad.b)} x2={W-pad.r} y2={pad.t+q*(H-pad.t-pad.b)}/>)}{series.map((s,si)=>{const pts=s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');return <g key={si}><polyline className={`line-series s${si}`} points={pts}/>{s.values.map((v,i)=><circle className={`point-series s${si}`} key={i} cx={x(i)} cy={y(v)} r="2.5"/>)}</g>})}{labels&&<><text x={pad.l} y={H-8}>1</text><text x={W-pad.r} y={H-8} textAnchor="end">{series[0].values.length}</text></>} </svg>}
function BarChart({items=[],valueKey='value',labelKey='label',currency=false}){if(!items.length)return <div className="empty-analytics">No chart data available.</div>;const max=Math.max(...items.map(x=>Number(x[valueKey]||0)),1);return <div className="vbars">{items.map((x,i)=><div className="vbar-wrap" key={x[labelKey]||i}><div className="vbar-value">{currency?money(x[valueKey]):Math.round(x[valueKey])}</div><div className="vbar-track"><span style={{height:`${Math.max(5,Number(x[valueKey]||0)/max*100)}%`}}/></div><div className="vbar-label">{x[labelKey]}</div></div>)}</div>}
function Intro(){return <div className="m2-banner"><div><div className="eyebrow"><Compass size={13}/> DIGITAL TWIN</div><h1>Digital Twin Simulation Engine</h1><p>Simulate future outcomes, compare decisions, explore historical patterns and generate personalized recommendations.</p></div><div className="m2-model"><BrainCircuit size={18}/><span><b>Scenario simulation</b><small>Current • Best • Risk • What-if purchases</small></span></div></div>}
const productMeta={bmw:{icon:Car,name:'BMW Car',tag:'Major purchase',desc:'See how a car purchase changes the savings path.'},apartment:{icon:Building2,name:'Apartment',tag:'Housing',desc:'Model a property purchase and its affordability effect.'},iphone18:{icon:Smartphone,name:'iPhone 18 Pro Max',tag:'Technology',desc:'Model the effect of a premium phone purchase.'},macbook:{icon:Laptop,name:'MacBook',tag:'Technology',desc:'Model a laptop purchase and recurring commitment.'},diamond:{icon:Diamond,name:'Diamond Necklace',tag:'Luxury',desc:'Model a high-value discretionary purchase.'}};

function ProjectHighlights({sim,exp,decision,modelInfo}){
  const metrics=modelInfo?.regression_metrics||{};
  const day=metrics.day||{}, week=metrics.week||{}, month=metrics.month||{};
  const modelPerformance=[
    {label:'Next day',value:Number(day.r2||0)*100},
    {label:'Next 7 days',value:Number(week.r2||0)*100},
    {label:'Next month',value:Number(month.r2||0)*100}
  ];
  const modelError=[
    {label:'Next day',value:Number(day.mae||0)},
    {label:'Next 7 days',value:Number(week.mae||0)},
    {label:'Next month',value:Number(month.mae||0)}
  ];
  const scenarioRows=decision?.rows||[];
  const scenarioSpend=scenarioRows.map(r=>({label:r.scenario==='expected'?'Expected':r.scenario==='best'?'Best':'Risk',value:r.expenditure}));
  const scenarioSavings=scenarioRows.map(r=>({label:r.scenario==='expected'?'Expected':r.scenario==='best'?'Best':'Risk',value:r.savings}));
  const scenarioRisk=scenarioRows.map(r=>({label:r.scenario==='expected'?'Expected':r.scenario==='best'?'Best':'Risk',value:r.overall_risk}));
  const topCategories=(exp?.category_distribution||[]).slice().sort((a,b)=>Number(b.average)-Number(a.average)).slice(0,6).map(x=>({label:x.category,value:x.average}));
  const records=Number(modelInfo?.dataset_rows||exp?.historical_records||0);
  const nulls=Number(modelInfo?.null_values||0);
  const duplicates=Number(modelInfo?.duplicate_rows||0);
  const featureCount=Number(modelInfo?.features?.length||21);
  return <section>
    <div className="m2-card highlights-hero">
      <div><span className="card-kicker">CORE IMPACT & METRICS</span><h2>RiskIntel AI — Quantifiable Results</h2><p>Evidence from the validated dataset, forecasting models and Digital Twin simulations.</p></div>
      <div className="highlight-badge"><BrainCircuit size={19}/> Data → Prediction → Decision</div>
    </div>

    <div className="m3-grid three impact-metric-grid">
      <div className="m2-card impact-metric"><span className="card-kicker">DATA COVERAGE</span><strong>{records.toLocaleString('en-IN')}</strong><h3>Validated records</h3><p>Training and exploratory analysis use the Milestone 2 dataset.</p></div>
      <div className="m2-card impact-metric"><span className="card-kicker">DATA QUALITY</span><strong>{nulls===0&&duplicates===0?'100%':'—'}</strong><h3>Clean dataset</h3><p>{nulls} null values • {duplicates} duplicate rows detected.</p></div>
      <div className="m2-card impact-metric"><span className="card-kicker">MODEL ACCURACY</span><strong>{month.r2?`${(Number(month.r2)*100).toFixed(1)}%`: '—'}</strong><h3>R² on held-out test set</h3><p>XGBoost regression with an 80/20 train-test split.</p></div>
      <div className="m2-card impact-metric"><span className="card-kicker">PREDICTIVE COVERAGE</span><strong>3</strong><h3>Forecast horizons</h3><p>Next day, Next 7 days and Next month.</p></div>
      <div className="m2-card impact-metric"><span className="card-kicker">DIGITAL TWIN</span><strong>3</strong><h3>Future scenarios</h3><p>Expected, Best Case and Risk Case comparisons.</p></div>
      <div className="m2-card impact-metric"><span className="card-kicker">WHAT-IF ANALYSIS</span><strong>5</strong><h3>Purchase simulations</h3><p>BMW, apartment, iPhone, MacBook and diamond necklace.</p></div>
    </div>

    <div className="m3-grid two">
      <div className="m2-card chart-card">
        <span className="card-kicker">QUANTIFIABLE RESULT</span><h3>Model performance by forecast horizon</h3>
        <p className="chart-note">Held-out test-set R²; higher values indicate a closer fit to the target in this controlled dataset.</p>
        <BarChart items={modelPerformance}/>
      </div>
      <div className="m2-card chart-card">
        <span className="card-kicker">PREDICTION ERROR</span><h3>Mean absolute error by horizon</h3>
        <p className="chart-note">Average absolute prediction error on the held-out test set, shown in rupees.</p>
        <BarChart items={modelError} currency/>
      </div>
    </div>

    <div className="m3-grid two">
      <div className="m2-card chart-card">
        <span className="card-kicker">DIGITAL TWIN IMPACT</span><h3>Projected expenditure across scenarios</h3>
        <p className="chart-note">Same user inputs, transformed into three controlled future assumptions.</p>
        <BarChart items={scenarioSpend} currency/>
      </div>
      <div className="m2-card chart-card">
        <span className="card-kicker">FINANCIAL BUFFER</span><h3>Projected savings across scenarios</h3>
        <p className="chart-note">Shows how the simulated future changes the available savings estimate.</p>
        <BarChart items={scenarioSavings} currency/>
      </div>
    </div>

    <div className="m3-grid two">
      <div className="m2-card chart-card">
        <span className="card-kicker">RISK SIGNAL</span><h3>Overall risk across simulated futures</h3>
        <p className="chart-note">Composite risk score used by the Digital Twin decision analysis.</p>
        <BarChart items={scenarioRisk}/>
      </div>
      <div className="m2-card chart-card">
        <span className="card-kicker">SPENDING IMPACT</span><h3>Top historical spending categories</h3>
        <p className="chart-note">Average category expenditure across the validated 1,000-record dataset.</p>
        <BarChart items={topCategories} currency/>
      </div>
    </div>

    <div className="m2-card quant-results-card">
      <div className="m2-card-head"><div><span className="card-kicker">QUANTIFIABLE RESULTS</span><h3>What the system delivers</h3><p>Measured or countable outputs from the current implementation.</p></div></div>
      <div className="quant-grid">
        <div><b>{featureCount}</b><span>predictive input features</span></div>
        <div><b>80 / 20</b><span>train-test split</span></div>
        <div><b>{records.toLocaleString('en-IN')}</b><span>validated records</span></div>
        <div><b>{nulls+duplicates===0?'0':'—'}</b><span>data-quality issues</span></div>
        <div><b>{modelInfo?.primary_model||'XGBoost'}</b><span>primary forecasting model</span></div>
        <div><b>{modelInfo?.secondary_model||'ARIMA(1,1,1)'}</b><span>trend-support model</span></div>
        <div><b>SHAP</b><span>prediction explainability</span></div>
        <div><b>Local LLM</b><span>browser-based AI assistant</span></div>
      </div>
    </div>

    <div className="m2-card impact-method-card">
      <span className="card-kicker">CORE IMPACT</span>
      <h3>From raw signals to measurable decision support</h3>
      <div className="method-grid">
        <div><b>1. Observe</b><p>Collect financial, wellness, study, work and habit signals.</p></div>
        <div><b>2. Predict</b><p>Generate horizon-specific expenditure and behavior forecasts.</p></div>
        <div><b>3. Simulate</b><p>Compare Expected, Best and Risk futures without changing stored data.</p></div>
        <div><b>4. Decide</b><p>Convert model outputs into risk comparisons and personalized recommendations.</p></div>
      </div>
    </div>
  </section>
}

function DigitalTwin(){const location=useLocation(),navigate=useNavigate();const [horizon,setHorizon]=useState('month');const [sim,setSim]=useState(null),[exp,setExp]=useState(null),[decision,setDecision]=useState(null),[recs,setRecs]=useState(null),[catalog,setCatalog]=useState(null),[purchase,setPurchase]=useState(null),[modelInfo,setModelInfo]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');const section=location.pathname.split('/')[2]||'simulation';
async function load(){setLoading(true);setError('');try{const [a,b,c,d,e,f]=await Promise.all([api.get(`/forecast/milestone3/simulation?horizon=${horizon}`),api.get(`/forecast/milestone3/exploration?horizon=${horizon}`),api.get(`/forecast/milestone3/decision?horizon=${horizon}`),api.get(`/forecast/milestone3/recommendations?horizon=${horizon}`),api.get(`/forecast/milestone3/purchase-catalog?horizon=${horizon}`),api.get('/forecast/model-info')]);setSim(a.data);setExp(b.data);setDecision(c.data);setRecs(d.data);setCatalog(e.data);setModelInfo(f.data)}catch(e){setError(e.response?.data?.detail||'Start the backend to load Milestone 3.')}finally{setLoading(false)}}
async function selectPurchase(key){setPurchase(null);try{const r=await api.get(`/forecast/milestone3/purchase-scenarios?product=${key}&horizon=${horizon}`);setPurchase(r.data)}catch(e){setError(e.response?.data?.detail||'Unable to load purchase simulation.')}}
useEffect(()=>{load()},[horizon]);
const rows=decision?.rows||[];const tabs=[['simulation','Simulation Engine'],['decision','Decision Analysis'],['exploration','Exploratory Analysis'],['recommendations','Recommendations'],['purchases','Scenario Analysis'],['highlights','Project Highlights']];
if(loading&&!sim)return <Loading/>;
return <><Intro/><div className="dt-toolbar"><div className="m2-tabs">{tabs.map(([k,n])=><button key={k} className={section===k?'active':''} onClick={()=>navigate(`/milestone3/${k}`)}>{n}</button>)}</div><div className="horizon-switch">{['day','week','month'].map(h=><button key={h} className={horizon===h?'active':''} onClick={()=>setHorizon(h)}>{h==='day'?'Next day':h==='week'?'Next 7 days':'Next month'}</button>)}<button onClick={load} title="Refresh"><RefreshCw size={14}/></button></div></div>{error&&<div className="error-banner">{error}</div>}
{section==='simulation'&&<section><div className="m3-grid three">{(sim?.scenarios||[]).map(s=><div className="m2-card scenario-card" key={s.scenario}><div className="scenario-head"><div><span className="card-kicker">{s.scenario==='expected'?'FOLLOW TREND':s.scenario==='best'?'IMPROVED OUTCOME':'REDUCED SAVINGS'}</span><h3>{s.label}</h3></div><RiskBadge value={s.risk.overall}/></div><div className="scenario-total">{money(s.prediction.predicted_total)}<small>predicted expenditure</small></div><div className="mini-stat-grid"><div><span>Projected savings</span><b>{money(s.prediction.predicted_savings)}</b></div><div><span>Top category</span><b>{s.prediction.top_category}</b></div><div><span>Financial risk</span><b>{Math.round(s.risk.financial)}</b></div><div><span>Productivity risk</span><b>{Math.round(s.risk.productivity)}</b></div></div><div className="scenario-delta"><span>vs expected expenditure</span><b>{s.comparison.expenditure_change_vs_expected>=0?'+':''}{money(s.comparison.expenditure_change_vs_expected)}</b></div></div>)}</div><div className="m3-grid two"><div className="m2-card"><div className="m2-card-head"><div><span className="card-kicker">FUTURE OUTCOMES</span><h3><BarChart3 size={16}/> Expenditure comparison</h3></div></div><ScenarioBars rows={rows} keyName="expenditure" currency/></div><div className="m2-card"><div className="m2-card-head"><div><span className="card-kicker">FINANCIAL BUFFER</span><h3><WalletCards size={16}/> Savings comparison</h3></div></div><ScenarioBars rows={rows} keyName="savings" currency/></div></div><div className="m2-card"><div className="m2-card-head"><div><span className="card-kicker">THREE FUTURES</span><h3><GitCompare size={16}/> Scenario methodology</h3></div></div><div className="method-grid"><div><b>Expected / Follow Trend</b><p>Current inputs continue as the baseline.</p></div><div><b>Best Case</b><p>Controlled discretionary spending and improved habit signals.</p></div><div><b>Risk Case</b><p>Higher discretionary pressure and reduced savings.</p></div></div></div></section>}
{section==='decision'&&<section><div className="m2-card"><div className="m2-card-head"><div><span className="card-kicker">DECISION SUPPORT</span><h3><GitCompare size={16}/> Compare future outcomes</h3><p>{decision?.interpretation}</p></div></div><div className="decision-table"><div className="decision-row header"><span>Scenario</span><span>Expenditure</span><span>Savings</span><span>Financial risk</span><span>Health risk</span><span>Productivity risk</span></div>{rows.map(r=><div className="decision-row" key={r.scenario}><b>{r.scenario}</b><span>{money(r.expenditure)}</span><span>{money(r.savings)}</span><span><RiskBadge value={r.financial_risk}/></span><span><RiskBadge value={r.health_risk}/></span><span><RiskBadge value={r.productivity_risk}/></span></div>)}</div></div><div className="m3-grid two"><div className="m2-card"><span className="card-kicker">EXPENDITURE</span><h3>Scenario movement</h3><ScenarioBars rows={rows} keyName="delta_expenditure" currency/></div><div className="m2-card"><span className="card-kicker">SAVINGS</span><h3>Change from expected</h3><ScenarioBars rows={rows} keyName="delta_savings" currency/></div></div><div className="m2-card chart-card"><span className="card-kicker">RISK PROFILE</span><h3>Scenario risk comparison</h3><BarChart items={rows.flatMap(r=>[{label:`${r.scenario} • Fin`,value:r.financial_risk},{label:`${r.scenario} • Health`,value:r.health_risk},{label:`${r.scenario} • Prod`,value:r.productivity_risk}])}/></div></section>}
{section==='exploration'&&<section>
<div className="m3-grid two">
<div className="m2-card chart-card"><div className="m2-card-head"><div><span className="card-kicker">HORIZON-AWARE OUTLOOK</span><h3><TrendingUp size={16}/> {exp?.horizon_outlook?.label||'Forecast outlook'}</h3><p>This graph changes when you select Next day, Next 7 days or Next month.</p></div></div><LineChart series={[{name:'Expenditure',values:exp?.horizon_outlook?.expenditure||[]}]}/><div className="legend"><span><i className="s0"/> Forecast expenditure</span></div></div>
<div className="m2-card chart-card"><span className="card-kicker">HORIZON CATEGORY MIX</span><h3>Predicted spending by category</h3><BarChart items={(exp?.category_horizon||[]).map(x=>({label:x.category,value:x.amount}))} currency/></div>
</div>
<div className="m3-grid two">
<div className="m2-card chart-card"><span className="card-kicker">SCENARIO COMPARISON</span><h3>Expected, best and risk outcomes</h3><BarChart items={(exp?.scenario_outlook||[]).map(x=>({label:x.scenario.replace(' / ',' '),value:x.expenditure}))} currency/></div>
<div className="m2-card chart-card"><span className="card-kicker">RISK PROFILE</span><h3>Risk across simulated futures</h3><BarChart items={(exp?.scenario_outlook||[]).map(x=>({label:x.scenario.replace(' / ',' '),value:x.risk}))}/></div>
</div>
<div className="m3-grid two"><div className="m2-card chart-card"><span className="card-kicker">HISTORICAL TREND</span><h3>Expenditure, savings & productivity</h3><LineChart series={[{name:'Expenditure',values:(exp?.historical_trend||[]).map(x=>x.expenditure)},{name:'Savings',values:(exp?.historical_trend||[]).map(x=>x.savings)},{name:'Productivity',values:(exp?.historical_trend||[]).map(x=>x.productivity)}]}/><div className="legend"><span><i className="s0"/> Expenditure</span><span><i className="s1"/> Savings</span><span><i className="s2"/> Productivity</span></div></div><div className="m2-card chart-card"><span className="card-kicker">AVERAGE SPENDING</span><h3>Category distribution</h3><BarChart items={(exp?.category_distribution||[]).map(x=>({label:x.category,value:x.average}))} currency/></div></div>
<div className="m3-grid two"><div className="m2-card chart-card"><span className="card-kicker">BEHAVIOR PROFILE</span><h3>Historical behavior averages</h3><BarChart items={(exp?.behavior_averages||[]).map(x=>({label:x.metric,value:x.value}))}/></div><div className="m2-card"><span className="card-kicker">CURRENT vs HISTORICAL</span><h3>Financial benchmark</h3><div className="decision-table"><div className="decision-row header"><span>Category</span><span>Current</span><span>Historical avg.</span><span>Difference</span></div>{(exp?.category_benchmarks||[]).map(x=><div className="decision-row" key={x.category}><b>{x.category}</b><span>{money(x.current)}</span><span>{money(x.historical_average)}</span><span className={x.difference>0?'text-up':'text-down'}>{x.difference>0?'+':''}{money(x.difference)}</span></div>)}</div></div></div>
<div className="m3-grid two"><div className="m2-card chart-card"><span className="card-kicker">MOOD & SPENDING</span><h3>Average expenditure by mood</h3><BarChart items={(exp?.mood_analysis||[]).map(x=>({label:x.mood,value:x.average_expenditure}))} currency/></div><div className="m2-card"><span className="card-kicker">MODEL SIGNALS</span><h3>Features correlated with selected horizon expenditure</h3><div className="impact-list">{(exp?.target_correlations||[]).map(x=><div className="impact-row" key={x.feature}><div><b>{x.feature}</b><span>Historical correlation</span></div><strong>{x.correlation}</strong></div>)}</div></div></div>
</section>}
{section==='highlights'&&<ProjectHighlights sim={sim} exp={exp} decision={decision} modelInfo={modelInfo}/>}
{section==='recommendations'&&<section><div className="m2-card recommendation-intro"><div className="summary-icon"><Lightbulb size={20}/></div><div><span className="card-kicker">ANALYSIS → CONCLUSION</span><h3>Personalized recommendation engine</h3><p>Current inputs + historical comparisons + forecast results.</p></div></div><div className="m3-grid two">{(recs?.recommendations||[]).map((r,i)=><div className="m2-card recommendation-card" key={i}><div className="recommendation-top"><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority} priority</span><CheckCircle2 size={18}/></div><h3>{r.title}</h3><div className="rec-step"><b>Observation / Evidence</b><p>{r.evidence}</p></div><div className="rec-step"><b>Recommendation</b><p>{r.recommendation}</p></div><div className="rec-step result"><b>Expected effect</b><p>{r.expected_effect}</p></div></div>)}</div><div className="m2-card"><span className="card-kicker">FORECAST CONTEXT</span><h3>Current predicted outcome</h3><div className="mini-stat-grid"><div><span>Predicted expenditure</span><b>{money(recs?.forecast?.predicted_total)}</b></div><div><span>Predicted savings</span><b>{money(recs?.forecast?.predicted_savings)}</b></div><div><span>Top category</span><b>{recs?.forecast?.top_category||'—'}</b></div><div><span>Model confidence</span><b>{recs?.forecast?.confidence?`${(recs.forecast.confidence*100).toFixed(1)}%`:'—'}</b></div></div></div></section>}
{section==='purchases'&&<section><div className="m2-card scenario-analysis-hero"><div><span className="card-kicker">WHAT-IF PURCHASE SIMULATION</span><h3><WalletCards size={17}/> What happens to savings if you buy it?</h3><p>Click a purchase to simulate its effect on available savings, monthly commitment, financial stress and a 5-year savings path.</p></div><span className="ai-badge">DIGITAL TWIN</span></div><div className="purchase-grid">{Object.entries(productMeta).map(([key,m])=>{const Icon=m.icon;const item=(catalog?.products||[]).find(x=>x.product===key);return <button className={`purchase-card ${purchase?.product===key?'selected':''}`} key={key} onClick={()=>selectPurchase(key)}><div className="purchase-icon"><Icon size={21}/></div><div><span className="purchase-tag">{m.tag}</span><h3>{m.name}</h3><p>{m.desc}</p></div><div className="purchase-price">{money(item?.assumed_price)}</div></button>})}</div>{purchase&&<div className="purchase-result"><div className="m3-grid two"><div className="m2-card purchase-summary"><div className="purchase-title"><div className="purchase-icon"><ShoppingBag size={20}/></div><div><span className="card-kicker">SELECTED SCENARIO</span><h3>{purchase.product_name}</h3></div></div><div className="big-impact">{money(purchase.assumed_price)}<small>assumed purchase price</small></div><div className="mini-stat-grid"><div><span>Current predicted savings</span><b>{money(purchase.baseline.predicted_savings)}</b></div><div><span>After purchase</span><b>{money(purchase.after_purchase.available_savings)}</b></div><div><span>Savings change</span><b className="text-up">{money(purchase.after_purchase.savings_change)}</b></div><div><span>Monthly commitment</span><b>{money(purchase.estimated_monthly_commitment)}</b></div></div><div className="impact-callout"><Activity size={17}/><div><b>Financial stress score: {purchase.financial_impact.stress_score}/100</b><small>Price-to-income ratio: {purchase.financial_impact.price_to_income_ratio}× • Monthly commitment ratio: {(purchase.financial_impact.monthly_commitment_ratio*100).toFixed(1)}%</small></div></div><p className="assumption-note">{purchase.assumptions}</p></div><div className="m2-card chart-card"><span className="card-kicker">5-YEAR OUTCOME</span><h3>Savings path with vs without purchase</h3><LineChart series={[{name:'Baseline',values:purchase.five_year.baseline_savings},{name:'Purchase scenario',values:purchase.five_year.purchase_savings}]}/><div className="legend"><span><i className="s0"/> Baseline savings</span><span><i className="s1"/> After purchase</span></div><div className="five-year-delta">Difference after 5 years: <b>{money(purchase.five_year.difference_at_5_years)}</b></div></div></div><div className="m3-grid three"><div className="m2-card"><span className="card-kicker">IMMEDIATE EFFECT</span><h3>Available savings</h3><div className="impact-number">{money(purchase.after_purchase.available_savings)}</div><p>Estimated savings buffer immediately after the one-time purchase.</p></div><div className="m2-card"><span className="card-kicker">AFFORDABILITY</span><h3>Recurring commitment</h3><div className="impact-number">{money(purchase.estimated_monthly_commitment)}<small>/ month</small></div><p>Illustrative monthly affordability commitment used by the simulation.</p></div><div className="m2-card"><span className="card-kicker">DECISION SIGNAL</span><h3>Cash shortfall</h3><div className="impact-number">{money(purchase.after_purchase.cash_shortfall)}</div><p>{purchase.after_purchase.cash_shortfall>0?'The purchase is larger than the projected savings buffer.':'Projected savings can cover the simulated one-time purchase.'}</p></div></div><div className="m2-card"><span className="card-kicker">INTERPRETATION</span><h3>How the Digital Twin calculates this scenario</h3><div className="method-grid"><div><b>1. Baseline</b><p>Use the user's current forecasted savings.</p></div><div><b>2. Purchase shock</b><p>Subtract the assumed one-time purchase price from the savings buffer.</p></div><div><b>3. Recurring effect</b><p>Apply the illustrative monthly commitment across the 5-year comparison path.</p></div></div></div></div>}</section>}
</>}
export default DigitalTwin;
