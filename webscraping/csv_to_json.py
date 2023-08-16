import pandas as pd
import numpy as np
from ast import literal_eval
import uuid


def safe_literal_eval(s):
    try:
        return literal_eval(s)
    except ValueError:
        return s


df = pd.read_csv("fas.csv")
print(df.head())
# df["instructors"].fillna(pd.Series([]))
df["instructors"] = df["instructors"].apply(safe_literal_eval)
df["uuid"] = [uuid.uuid4().hex for _ in range(len(df.index))]
df.to_json("fas.json", orient="table", index=False)
