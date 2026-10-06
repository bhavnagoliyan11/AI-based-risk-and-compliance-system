from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ForecastSnapshot, Activity
from ..schemas import ForecastInput, SimulationInput
from ..auth import get_current_user
from ..forecasting_engine import predict, model_info, history as dataset_history, trend as trend_forecast, explain
from ..milestone3_engine import simulate_scenarios, exploratory_analysis, recommendations, decision_analysis

router = APIRouter()
FIELDS = ['income','rent','shopping','food','healthcare','taxes','installment','transport','education','entertainment','other','savings',
          'study_hours','work_hours','screen_hours','sleep_hours','exercise_days','tasks_completed','productivity_score','energy_level','mood']

def item_data(item):
    return {k:getattr(item,k) for k in FIELDS}

def current_data(user, db):
    item=db.query(ForecastSnapshot).filter(ForecastSnapshot.user_id==user.id).order_by(ForecastSnapshot.created_at.desc()).first()
    if item:
        return item_data(item)
    p=getattr(user,'profile',None)
    return {k:(getattr(p,k,0) if p and hasattr(p,k) else ('Neutral' if k=='mood' else 0)) for k in FIELDS}

@router.get('/model-info')
def info(user=Depends(get_current_user)):
    return model_info()

@router.get('/inputs')
def get_inputs(user=Depends(get_current_user), db: Session=Depends(get_db)):
    return current_data(user, db)

@router.put('/inputs')
def save_inputs(data: ForecastInput, user=Depends(get_current_user), db: Session=Depends(get_db)):
    item=ForecastSnapshot(user_id=user.id, **data.model_dump())
    db.add(item)
    db.add(Activity(user_id=user.id, action='Forecast inputs updated', category='forecasting',
                    details='Financial, productivity, screen-time, wellness and mood signals saved for forecasting.'))
    db.commit(); db.refresh(item)
    return item_data(item)

@router.get('')
def forecast(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    data=current_data(user, db)
    return {'inputs':data,'prediction':predict(data,horizon),'model_info':model_info()}

@router.get('/history')
def forecast_history(horizon: str=Query('month', pattern='^(day|week|month)$'), limit: int=Query(12, ge=2, le=60), user=Depends(get_current_user), db: Session=Depends(get_db)):
    items=db.query(ForecastSnapshot).filter(ForecastSnapshot.user_id==user.id).order_by(ForecastSnapshot.created_at.asc()).limit(60).all()
    if len(items) >= 2:
        rows=[]
        for item in items[-limit:]:
            d=item_data(item); p=predict(d,horizon)
            rows.append({'period':item.created_at.isoformat(),'current_expenditure':p['current_total'],
                         'predicted_expenditure':p['predicted_total'],'study_hours':p['behavioral']['study_period'],
                         'sleep_hours':p['behavioral']['sleep_period'],'screen_hours':d['screen_hours'],
                         'productivity_score':d['productivity_score'],'energy_level':d['energy_level'],
                         'exercise_days':d['exercise_days']})
        source='user_snapshots'
    else:
        rows=dataset_history(horizon,limit); source='synthetic_training_history'
    return {'source':source,'horizon':horizon,'rows':rows}

@router.get('/trend')
def trend(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user)):
    return trend_forecast(horizon)

@router.get('/explain')
def explanation(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    return explain(current_data(user, db), horizon)

@router.post('/simulate')
def simulate(data: SimulationInput, horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user)):
    return predict(data.model_dump(), horizon)


@router.get('/milestone3/simulation')
def milestone3_simulation(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    return simulate_scenarios(current_data(user, db), horizon)

@router.get('/milestone3/exploration')
def milestone3_exploration(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    return exploratory_analysis(current_data(user, db), horizon)

@router.get('/milestone3/decision')
def milestone3_decision(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    return decision_analysis(current_data(user, db), horizon)

@router.get('/milestone3/recommendations')
def milestone3_recommendations(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    return recommendations(current_data(user, db), horizon)

@router.get('/milestone3/purchase-scenarios')
def milestone3_purchase_scenarios(product: str=Query('bmw'), horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    from ..milestone3_engine import purchase_scenario
    return purchase_scenario(current_data(user, db), product, horizon)

@router.get('/milestone3/purchase-catalog')
def milestone3_purchase_catalog(horizon: str=Query('month', pattern='^(day|week|month)$'), user=Depends(get_current_user), db: Session=Depends(get_db)):
    from ..milestone3_engine import purchase_catalog
    return purchase_catalog(current_data(user, db), horizon)

@router.post('/milestone3/chatbot')
def milestone3_chatbot(payload: dict, user=Depends(get_current_user), db: Session=Depends(get_db)):
    """RiskIntel project assistant. Uses an OpenAI-compatible API when configured and
    falls back to a project-aware local answer engine when no API key is present."""
    from ..chatbot_engine import answer_question
    question = str(payload.get('question', '')).strip()
    assistant_name = str(payload.get('assistant_name', 'RiskBot')).strip()[:40] or 'RiskBot'
    if not question:
        return {'answer': f"Hi, I am {assistant_name}. Please ask me a question.", 'source': 'local'}
    return answer_question(question, assistant_name, current_data(user, db))
