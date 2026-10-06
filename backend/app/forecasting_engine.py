from functools import lru_cache
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

BASE = Path(__file__).resolve().parents[2]
DATA = BASE / "dataset_riskintel_m2_1000.csv"
MOOD = {'Sad':1,'Stressed':2,'Anxious':2,'Neutral':3,'Calm':4,'Happy':5}
CATS = ['rent','shopping','food','healthcare','taxes','installment','transport','education','entertainment','other']
FEATURES = ['income','rent','shopping','food','healthcare','taxes','installment','transport','education','entertainment','other','savings',
            'study_hours','work_hours','screen_hours','sleep_hours','exercise_days','tasks_completed','productivity_score','energy_level','mood_score']
HORIZONS = {'day': 1, 'week': 7, 'month': 30}
HORIZON_LABELS = {'day':'Next day','week':'Next 7 days','month':'Next month'}

# Load and validate the controlled Milestone 2 dataset.
df = pd.read_csv(DATA)
if len(df) != 1000:
    raise ValueError(f"Milestone 2 dataset must contain exactly 1000 records; found {len(df)}")
if df.isna().sum().sum() != 0:
    raise ValueError("Milestone 2 dataset contains null values")
if df.duplicated().sum() != 0:
    raise ValueError("Milestone 2 dataset contains duplicate rows")
if 'period_start' in df.columns:
    df['period_start'] = pd.to_datetime(df['period_start'])
df['mood_score'] = df['mood'].map(MOOD).astype(float)

# The dataset's next_total_expenditure is the monthly predictive target.  We derive
# explicit horizon targets so the three UI choices are trained targets, not merely labels.
if 'next_day_total_expenditure' not in df.columns:
    df['next_day_total_expenditure'] = (df['next_total_expenditure'] / 30).round(2)
if 'next_7d_total_expenditure' not in df.columns:
    df['next_7d_total_expenditure'] = (df['next_total_expenditure'] * 7 / 30).round(2)
if 'next_month_total_expenditure' not in df.columns:
    df['next_month_total_expenditure'] = df['next_total_expenditure'].round(2)

train_idx, test_idx = train_test_split(np.arange(len(df)), test_size=.2, random_state=42)
models, metrics = {}, {}

def build_model():
    return XGBRegressor(n_estimators=220, max_depth=4, learning_rate=.045, subsample=.9,
                        colsample_bytree=.9, objective='reg:squarederror', random_state=42, n_jobs=2)

# Personalized horizon-specific total expenditure models.
for h, target in [('day','next_day_total_expenditure'),('week','next_7d_total_expenditure'),('month','next_month_total_expenditure')]:
    model = build_model()
    model.fit(df.iloc[train_idx][FEATURES], df.iloc[train_idx][target])
    pred = model.predict(df.iloc[test_idx][FEATURES])
    metrics[h] = {
        'mae': round(float(mean_absolute_error(df.iloc[test_idx][target], pred)), 2),
        'rmse': round(float(mean_squared_error(df.iloc[test_idx][target], pred) ** 0.5), 2),
        'r2': round(float(r2_score(df.iloc[test_idx][target], pred)), 3)
    }
    models[f'total_{h}'] = model

# Category and behavior models use the existing next-period targets.
TARGETS = [f'next_{c}' for c in CATS] + ['next_study_hours','next_sleep_hours','next_productivity_score','next_energy_level','next_exercise_days']
for target in TARGETS:
    model = build_model()
    model.fit(df.iloc[train_idx][FEATURES], df.iloc[train_idx][target])
    models[target] = model


def _as_dict(data):
    return data.model_dump() if hasattr(data, 'model_dump') else dict(data)


def make_features(data):
    vals = _as_dict(data)
    vals['mood_score'] = MOOD.get(vals.get('mood','Neutral'), 3)
    return pd.DataFrame([[float(vals.get(k,0)) for k in FEATURES]], columns=FEATURES)


def _confidence(x):
    coverage=[]
    for k in FEATURES:
        lo, hi = float(df[k].min()), float(df[k].max())
        val=float(x.iloc[0][k])
        coverage.append(1 if lo <= val <= hi else max(0,1-abs(val-(lo if val<lo else hi))/max(hi-lo,1)))
    return round(70+25*(sum(coverage)/len(coverage)),1)


def _arima_daily_forecast(days=30):
    """Secondary population-level time-series trend model.
    The synthetic dataset contains dated observations. ARIMA provides a trend signal,
    while XGBoost remains the user-personalized primary model.
    """
    try:
        from statsmodels.tsa.arima.model import ARIMA
        series = pd.Series(df['next_month_total_expenditure'].astype(float).values)
        model = ARIMA(series, order=(1,1,1), enforce_stationarity=False, enforce_invertibility=False)
        fitted = model.fit()
        values = np.maximum(0, np.asarray(fitted.forecast(steps=days), dtype=float))
        return values
    except Exception:
        # Graceful fallback keeps the product runnable even if the optional time-series
        # dependency is unavailable.
        return np.repeat(float(df['next_month_total_expenditure'].tail(30).mean()), days)


@lru_cache(maxsize=1)
def trend_model_cache():
    return _arima_daily_forecast(30)


def predict(data, horizon='month'):
    vals = _as_dict(data)
    horizon = horizon if horizon in HORIZONS else 'month'
    x = make_features(vals)
    days = HORIZONS[horizon]

    # XGBoost is the personalized primary forecast.
    xgb_total = max(0, float(models[f'total_{horizon}'].predict(x)[0]))
    arima_monthly_series = trend_model_cache()
    arima_horizon = float(np.sum(arima_monthly_series[:days]) / 30.0)
    # Hybrid blend: 85% personalized ML + 15% population time-series trend.
    predicted_total = round(max(0, xgb_total * .85 + arima_horizon * .15), 2)

    monthly_categories = {c: round(max(0, float(models[f'next_{c}'].predict(x)[0])), 2) for c in CATS}
    scale = days / 30.0
    cats = [{'category':c.replace('_',' ').title(), 'amount':round(v*scale,2),
             'share':round(v/max(sum(monthly_categories.values()),1)*100,1)}
            for c,v in sorted(monthly_categories.items(), key=lambda kv: kv[1], reverse=True)]
    fixed_month = sum(monthly_categories[k] for k in ['rent','taxes','installment'])
    current_month = sum(float(vals.get(k,0)) for k in CATS)
    current_total = round(current_month * scale, 2)
    fixed = round(fixed_month * scale, 2)
    variable = round(max(0,predicted_total-fixed),2)

    behavioral = {
        'study_hours': round(max(0,float(models['next_study_hours'].predict(x)[0])),2),
        'sleep_hours': round(max(0,float(models['next_sleep_hours'].predict(x)[0])),2),
        'productivity_score': round(min(100,max(0,float(models['next_productivity_score'].predict(x)[0]))),1),
        'energy_level': round(min(100,max(0,float(models['next_energy_level'].predict(x)[0]))),1),
        'exercise_days': int(min(7,max(0,round(float(models['next_exercise_days'].predict(x)[0])))))
    }
    if horizon == 'day':
        study_period = behavioral['study_hours']; exercise_period = round(behavioral['exercise_days']/7,2)
    elif horizon == 'week':
        study_period = round(behavioral['study_hours']*7,2); exercise_period = behavioral['exercise_days']
    else:
        study_period = round(behavioral['study_hours']*30,2); exercise_period = round(behavioral['exercise_days']*4.345,1)

    income_horizon = float(vals.get('income',0)) * scale
    return {
        'horizon':horizon,'horizon_label':HORIZON_LABELS[horizon],
        'predicted_total':predicted_total,
        'xgboost_prediction':round(xgb_total,2),'time_series_prediction':round(arima_horizon,2),
        'predicted_savings':round(max(0,income_horizon-predicted_total),2),
        'current_total':current_total,
        'monthly_model_total':round(float(models['total_month'].predict(x)[0]),2),
        'change_percent':round((predicted_total-current_total)/max(current_total,1)*100,1),
        'categories':cats,'top_category':cats[0]['category'],'fixed_expense':fixed,'variable_expense':variable,
        'confidence':_confidence(x),'model':'Hybrid XGBoost + ARIMA trend',
        'primary_model':'XGBoost Regressor','secondary_model':'ARIMA(1,1,1)',
        'metrics':metrics[horizon],
        'behavioral':{**behavioral,'study_period':study_period,'exercise_period':exercise_period,'sleep_period':behavioral['sleep_hours']},
        'mood_benchmarks':df.groupby('mood')['next_month_total_expenditure'].mean().sort_values(ascending=False).round(2).to_dict()
    }


def history(horizon='month', limit=12):
    factor = HORIZONS.get(horizon,30)/30
    sample = df.tail(limit).copy()
    rows=[]
    for _,r in sample.iterrows():
        current=sum(float(r[c]) for c in CATS)
        rows.append({
            'period':str(r['period_start']),
            'current_expenditure':round(current*factor,2),
            'predicted_expenditure':round(float(r['next_month_total_expenditure'])*factor,2),
            'study_hours':round(float(r['study_hours']) * (7 if horizon=='week' else 30 if horizon=='month' else 1),2),
            'sleep_hours':round(float(r['sleep_hours']),2),
            'screen_hours':round(float(r['screen_hours']),2),
            'productivity_score':round(float(r['productivity_score']),1),
            'energy_level':round(float(r['energy_level']),1),
            'exercise_days':int(r['exercise_days'])
        })
    return rows


def trend(horizon='month'):
    horizon = horizon if horizon in HORIZONS else 'month'
    days = HORIZONS[horizon]
    ts = trend_model_cache()[:days]
    daily = np.maximum(0, ts / 30.0)
    cumulative = np.cumsum(daily)
    rows=[]
    start = pd.Timestamp.today().normalize()
    for i in range(days):
        rows.append({'period':str((start+pd.Timedelta(days=i+1)).date()),
                     'daily_trend':round(float(daily[i]),2),
                     'cumulative_expenditure':round(float(cumulative[i]),2)})
    return {'model':'ARIMA(1,1,1)','horizon':horizon,'rows':rows}


def explain(data, horizon='month', top_n=8):
    horizon = horizon if horizon in HORIZONS else 'month'
    x = make_features(data)
    model = models[f'total_{horizon}']
    names = FEATURES
    shap_used = False
    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_used = True
        values = np.asarray(explainer.shap_values(x)).reshape(-1)
    except Exception:
        # Fallback to XGBoost gain importance scaled by the current feature magnitude.
        imp = model.feature_importances_
        values = imp * x.iloc[0].to_numpy(dtype=float)
    rows=[]
    for name,val,raw in zip(names,values,x.iloc[0].to_numpy(dtype=float)):
        rows.append({'feature':name.replace('_',' ').title(),'value':round(float(raw),2),
                     'impact':round(float(val),2),'direction':'increases prediction' if val>=0 else 'reduces prediction'})
    rows.sort(key=lambda r:abs(r['impact']),reverse=True)
    return {'horizon':horizon,'base_prediction':round(float(model.predict(x)[0]),2),'explanations':rows[:top_n],
            'method':'SHAP TreeExplainer' if shap_used else 'XGBoost feature importance fallback'}


def model_info():
    return {
        'dataset_rows':int(len(df)),'dataset_columns':int(len(df.columns)),
        'null_values':int(df.isna().sum().sum()),'duplicate_rows':int(df.duplicated().sum()),
        'features':FEATURES,'primary_model':'XGBoost Regressor','secondary_model':'ARIMA(1,1,1)',
        'explainability':'SHAP TreeExplainer','validation':'80/20 train-test split','horizons':['day','week','month'],
        'regression_metrics':metrics,'dataset_file':DATA.name
    }
