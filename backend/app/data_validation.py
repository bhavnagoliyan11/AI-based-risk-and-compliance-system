from pathlib import Path
import pandas as pd
DATA=Path(__file__).resolve().parents[2]/"dataset_riskintel_m2_1000.csv"
df=pd.read_csv(DATA)
print({"rows":len(df),"columns":len(df.columns),"null_values":int(df.isna().sum().sum()),"duplicate_rows":int(df.duplicated().sum())})
