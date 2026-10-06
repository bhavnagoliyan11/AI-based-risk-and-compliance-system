from .forecasting_engine import df, CATS, HORIZONS, HORIZON_LABELS, predict, _as_dict
import numpy as np


def _scenario_inputs(data, scenario):
    d = dict(_as_dict(data))
    if scenario == 'best':
        for k, factor in {'shopping':.75,'food':.90,'entertainment':.65,'other':.80,'transport':.90,'savings':1.10}.items():
            d[k] = max(0, float(d.get(k,0)) * factor)
        d['screen_hours'] = max(0, float(d.get('screen_hours',0)) * .80)
        d['study_hours'] = min(24, float(d.get('study_hours',0)) * 1.15)
        d['sleep_hours'] = min(24, float(d.get('sleep_hours',0)) + .5)
        d['exercise_days'] = min(7, int(round(float(d.get('exercise_days',0)) + 1)))
        d['productivity_score'] = min(100, float(d.get('productivity_score',0)) + 8)
        d['energy_level'] = min(100, float(d.get('energy_level',0)) + 6)
    elif scenario == 'risk':
        for k, factor in {'shopping':1.30,'food':1.15,'healthcare':1.10,'entertainment':1.40,'other':1.20,'transport':1.10,'savings':.60}.items():
            d[k] = max(0, float(d.get(k,0)) * factor)
        d['screen_hours'] = min(24, float(d.get('screen_hours',0)) * 1.25)
        d['study_hours'] = max(0, float(d.get('study_hours',0)) * .80)
        d['sleep_hours'] = max(0, float(d.get('sleep_hours',0)) - .75)
        d['exercise_days'] = max(0, int(round(float(d.get('exercise_days',0)) - 1)))
        d['productivity_score'] = max(0, float(d.get('productivity_score',0)) - 10)
        d['energy_level'] = max(0, float(d.get('energy_level',0)) - 10)
    return d


def _risk_bundle(d, prediction):
    income = max(float(d.get('income',0)), 1)
    total = float(prediction['predicted_total'])
    savings = max(0, income * (HORIZONS[prediction['horizon']] / 30) - total)
    fixed = float(prediction['fixed_expense'])
    financial = min(100, max(0, (total / income) * 65 + (fixed / income) * 35))
    wellness = (min(100, float(d.get('sleep_hours',0))/8*40) + min(100,float(d.get('exercise_days',0))/5*20) + float(d.get('energy_level',0))*.25 + max(0,100-min(100,float(d.get('screen_hours',0))/10*100))*.15)
    health = max(0, min(100, 100-wellness))
    productivity = max(0, min(100, 100-(float(d.get('productivity_score',0))*.6 + min(100,float(d.get('tasks_completed',0))*10)*.2 + min(100,float(d.get('study_hours',0))*10)*.2)))
    overall = round((financial+health+productivity)/3, 1)
    return {'financial':round(financial,1),'health':round(health,1),'productivity':round(productivity,1),'overall':overall,
            'savings':round(savings,2),'fixed_expense':round(fixed,2)}


def simulate_scenarios(data, horizon='month'):
    horizon = horizon if horizon in HORIZONS else 'month'
    names = [('expected','Expected / Follow Trend'),('best','Best Case'),('risk','Risk Case / Reduced Savings')]
    rows=[]
    for key,label in names:
        d = _scenario_inputs(data,key)
        p = predict(d,horizon)
        r = _risk_bundle(d,p)
        rows.append({'scenario':key,'label':label,'inputs':d,'prediction':p,'risk':r})
    base=rows[0]['prediction']['predicted_total']
    for row in rows:
        row['comparison']={
            'expenditure_change_vs_expected':round(row['prediction']['predicted_total']-base,2),
            'savings_change_vs_expected':round(row['prediction']['predicted_savings']-rows[0]['prediction']['predicted_savings'],2),
            'risk_change_vs_expected':round(row['risk']['overall']-rows[0]['risk']['overall'],1)
        }
    return {'horizon':horizon,'horizon_label':HORIZON_LABELS[horizon],'scenarios':rows,
            'method':'Digital Twin rule-based scenario transformation + hybrid XGBoost/ARIMA forecast',
            'note':'Scenarios are simulations based on the current user inputs and Milestone 2 historical training data; they are not guaranteed outcomes.'}


def exploratory_analysis(data, horizon='month'):
    """Exploratory analysis with horizon-aware charts.
    Scatter plots are intentionally not returned; the UI uses clearer bar/line charts.
    """
    d = _as_dict(data)
    horizon = horizon if horizon in HORIZONS else 'month'
    numeric = ['income'] + CATS + ['savings','study_hours','work_hours','screen_hours','sleep_hours','exercise_days','tasks_completed','productivity_score','energy_level']
    target = f'next_{horizon}_total_expenditure'
    target_corr = df[numeric + [target]].corr(numeric_only=True)[target].drop(target).sort_values(key=lambda s: s.abs(), ascending=False)

    hist = []
    for c in ['shopping','food','healthcare','taxes','installment','rent','savings']:
        avg = float(df[c].mean()); cur = float(d.get(c, 0))
        hist.append({'category': c.replace('_',' ').title(), 'current': round(cur,2),
                     'historical_average': round(avg,2), 'difference': round(cur-avg,2)})

    trend_sample = df.tail(60).reset_index(drop=True)
    historical_trend = [{'record': i+1,
                         'expenditure': round(float(r[CATS].sum()),2),
                         'savings': round(float(r['savings']),2),
                         'productivity': round(float(r['productivity_score']),2)}
                        for i,r in trend_sample.iterrows()]
    category_distribution = [{'category': c.replace('_',' ').title(), 'average': round(float(df[c].mean()),2)} for c in CATS]
    behavior_averages = [
        {'metric':'Study hours','value':round(float(df['study_hours'].mean()),2)},
        {'metric':'Work hours','value':round(float(df['work_hours'].mean()),2)},
        {'metric':'Screen hours','value':round(float(df['screen_hours'].mean()),2)},
        {'metric':'Sleep hours','value':round(float(df['sleep_hours'].mean()),2)},
        {'metric':'Productivity','value':round(float(df['productivity_score'].mean()),2)},
        {'metric':'Energy','value':round(float(df['energy_level'].mean()),2)}
    ]
    mood_analysis = []
    for mood, grp in df.groupby('mood'):
        mood_analysis.append({'mood':mood,
                              'average_expenditure':round(float(grp[target].mean()),2),
                              'average_savings':round(float(grp['savings'].mean()),2),
                              'records':int(len(grp))})
    mood_analysis = sorted(mood_analysis, key=lambda x:x['average_expenditure'], reverse=True)

    # Horizon-specific forecast cards/graphs. These values change whenever the user
    # switches Next day / Next 7 days / Next month.
    p = predict(d, horizon)
    days = HORIZONS[horizon]
    if horizon == 'day':
        periods = ['Today','Next day']
        factor_values = [p['current_total'], p['predicted_total']]
    elif horizon == 'week':
        periods = [f'Day {i}' for i in range(1,8)]
        start = float(p['current_total'])
        end = float(p['predicted_total'])
        factor_values = [round(start + (end-start)*i/6, 2) for i in range(7)]
    else:
        periods = ['Week 1','Week 2','Week 3','Week 4']
        start = float(p['current_total'])
        end = float(p['predicted_total'])
        factor_values = [round(start + (end-start)*i/3, 2) for i in range(4)]

    category_horizon = [{'category': item['category'], 'amount': item['amount']} for item in p['categories']]
    scenario = simulate_scenarios(d, horizon)
    scenario_outlook = [
        {'scenario': s['label'], 'expenditure': s['prediction']['predicted_total'],
         'savings': s['prediction']['predicted_savings'], 'risk': s['risk']['overall']}
        for s in scenario['scenarios']
    ]
    horizon_outlook = {
        'label': HORIZON_LABELS[horizon],
        'periods': periods,
        'expenditure': factor_values,
        'predicted_total': p['predicted_total'],
        'predicted_savings': p['predicted_savings'],
        'risk': scenario['scenarios'][0]['risk']['overall']
    }

    return {
        'historical_records': int(len(df)),
        'target': target,
        'target_correlations': [{'feature': k.replace('_',' ').title(), 'correlation': round(float(v),3)} for k,v in target_corr.head(10).items()],
        'category_benchmarks': hist,
        'historical_trend': historical_trend,
        'category_distribution': category_distribution,
        'behavior_averages': behavior_averages,
        'mood_analysis': mood_analysis,
        'horizon_outlook': horizon_outlook,
        'category_horizon': category_horizon,
        'scenario_outlook': scenario_outlook,
        'dataset_note': 'Exploratory statistics use the validated 1,000-record Milestone 2 dataset. Horizon charts are generated from the selected personalized forecast.'
    }


def recommendations(data, horizon='month'):
    d=_as_dict(data); p=predict(d,horizon); recs=[]
    def add(priority,title,evidence,action,expected):
        recs.append({'priority':priority,'title':title,'evidence':evidence,'recommendation':action,'expected_effect':expected})
    for c in ['shopping','entertainment','other']:
        cur=float(d.get(c,0)); avg=float(df[c].mean())
        if cur > avg*1.15:
            add('High',f'Review {c.replace("_"," ")} spending',f'Current {c.replace("_"," ")} is {cur:.0f}, above the dataset average of {avg:.0f}.',f'Set a monthly cap for {c.replace("_"," ")} and review non-essential purchases.', 'Lower variable expenditure and improve projected savings.')
    income=max(float(d.get('income',0)),1)
    fixed=(float(d.get('rent',0))+float(d.get('taxes',0))+float(d.get('installment',0)))/income
    if fixed>.45:
        add('High','Protect against fixed-cost pressure',f'Rent + taxes + installments are {fixed*100:.1f}% of monthly income.', 'Maintain a dedicated buffer before increasing discretionary spending.', 'Reduce sensitivity to unexpected expenses.')
    if float(d.get('screen_hours',0))>float(df['screen_hours'].mean())*1.15:
        add('Medium','Monitor screen-time pattern',f'Current screen time is {float(d.get("screen_hours",0)):.1f} h/day versus historical average {df["screen_hours"].mean():.1f} h/day.', 'Set a daily screen-time target and compare it with productivity each week.', 'Support steadier productivity signals.')
    if float(d.get('study_hours',0))<float(df['study_hours'].mean())*.85:
        add('Medium','Strengthen study consistency',f'Study time is {float(d.get("study_hours",0)):.1f} h/day versus historical average {df["study_hours"].mean():.1f}.', 'Use a small fixed study block and track completion.', 'Improve future study-hour and productivity signals.')
    if float(d.get('savings',0))<float(d.get('income',0))*.15:
        add('High','Increase savings buffer',f'Current savings allocation is {float(d.get("savings",0)):.0f}, below 15% of income.', 'Move a defined amount to savings before discretionary spending.', 'Increase projected savings and reduce financial risk.')
    if not recs:
        add('Low','Continue monitoring','Current inputs are within the main historical ranges in the dataset.','Keep recording spending, study, work and habit signals so the twin can update its baseline.','Maintain a reliable personalized trend history.')
    return {'horizon':horizon,'recommendations':recs,'basis':['current user inputs','historical Milestone 2 dataset','forecast model output'],'forecast':p,
            'conclusion':'Recommendations are generated from observed current-versus-historical differences and simulated forecast results.'}


def decision_analysis(data,horizon='month'):
    sim=simulate_scenarios(data,horizon)
    exp=sim['scenarios'][0]
    rows=[]
    for s in sim['scenarios']:
        rows.append({'scenario':s['label'],'expenditure':s['prediction']['predicted_total'],'savings':s['prediction']['predicted_savings'],
                     'financial_risk':s['risk']['financial'],'health_risk':s['risk']['health'],'productivity_risk':s['risk']['productivity'],'overall_risk':s['risk']['overall'],
                     'delta_expenditure':s['comparison']['expenditure_change_vs_expected'],'delta_savings':s['comparison']['savings_change_vs_expected']})
    return {'horizon':horizon,'rows':rows,'decision_dimensions':['expenditure','savings','financial risk','health/wellness signal','productivity/habit signal'],
            'interpretation':'Compare the three simulated futures across these dimensions. The expected case follows current inputs, the best case applies controlled-spending and habit improvements, and the risk case increases discretionary pressure and reduces savings.'}

PURCHASE_SCENARIOS = {
    'bmw': {'name':'BMW Car','price':8000000,'life_months':60,'monthly_extra':150000,'category':'Vehicle'},
    'apartment': {'name':'Apartment','price':6000000,'life_months':240,'monthly_extra':35000,'category':'Housing'},
    'iphone18': {'name':'iPhone 18 Pro Max','price':150000,'life_months':24,'monthly_extra':7000,'category':'Technology'},
    'macbook': {'name':'MacBook','price':200000,'life_months':36,'monthly_extra':7000,'category':'Technology'},
    'diamond': {'name':'Diamond Necklace','price':500000,'life_months':24,'monthly_extra':22000,'category':'Luxury'},
}


def purchase_scenario(data, product='bmw', horizon='month'):
    d=_as_dict(data)
    product = product if product in PURCHASE_SCENARIOS else 'bmw'
    item=PURCHASE_SCENARIOS[product]
    base=predict(d,horizon)
    income=max(float(d.get('income',0)),1)
    current_savings=max(float(base.get('predicted_savings',0)),0)
    price=float(item['price'])
    # The simulation treats the purchase as a one-time reduction of the available savings buffer.
    after_purchase=max(0,current_savings-price)
    shortfall=max(0,price-current_savings)
    monthly_payment=float(item['monthly_extra'])
    monthly_saving_after=max(0,current_savings-monthly_payment)
    years=5
    months=years*12
    base_monthly=max(current_savings,0)
    base_path=[]; purchase_path=[]
    for m in range(1,months+1):
        base_path.append(round(base_monthly*m,2))
        # Purchase path: one-time price at month 1 + recurring monthly affordability effect.
        purchase_path.append(round(max(0, base_monthly*m-price-monthly_payment*max(0,m-1)),2))
    delta_5y=round(purchase_path[-1]-base_path[-1],2)
    financial_stress=min(100, round((price/income)*18 + (monthly_payment/income)*55 + (shortfall/max(income,1))*12,1))
    return {
        'product':product,'product_name':item['name'],'category':item['category'],'assumed_price':price,
        'financing_months':item['life_months'],'estimated_monthly_commitment':monthly_payment,
        'horizon':horizon,'horizon_label':HORIZON_LABELS[horizon],
        'baseline':{'predicted_expenditure':round(float(base['predicted_total']),2),'predicted_savings':round(current_savings,2)},
        'after_purchase':{'available_savings':round(after_purchase,2),'savings_change':round(after_purchase-current_savings,2),
                          'monthly_savings_after_commitment':round(monthly_saving_after,2),'cash_shortfall':round(shortfall,2)},
        'financial_impact':{'stress_score':financial_stress,'price_to_income_ratio':round(price/income,2),'monthly_commitment_ratio':round(monthly_payment/income,3)},
        'five_year':{'months':list(range(1,months+1)),'baseline_savings':base_path,'purchase_savings':purchase_path,'difference_at_5_years':delta_5y},
        'interpretation':f"This is a what-if simulation using an assumed purchase price of {price:,.0f}. It estimates how a one-time purchase plus a recurring affordability commitment could change the savings path.",
        'assumptions':'Illustrative project assumptions, not live market quotations or financial advice.'
    }


def purchase_catalog(data,horizon='month'):
    result=[]
    for key,item in PURCHASE_SCENARIOS.items():
        s=purchase_scenario(data,key,horizon)
        result.append({'product':key,'name':item['name'],'category':item['category'],'assumed_price':item['price'],
                       'monthly_commitment':item['monthly_extra'],'savings_after_purchase':s['after_purchase']['available_savings'],
                       'savings_change':s['after_purchase']['savings_change'],'stress_score':s['financial_impact']['stress_score']})
    return {'horizon':horizon,'products':result,'note':'Prices and financing commitments are illustrative assumptions for the Digital Twin demonstration.'}
