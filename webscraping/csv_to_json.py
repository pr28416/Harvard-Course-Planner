import pandas as pd
import numpy as np
from ast import literal_eval
import uuid


def safe_literal_eval(s):
    try:
        return literal_eval(s)
    except ValueError:
        return s


def main():
    df = pd.read_csv("courses1.csv")
    print(df.head())
    # df["instructors"].fillna(pd.Series([]))
    df["instructors"] = df["instructors"].apply(safe_literal_eval)
    df["uuid"] = [uuid.uuid4().hex for _ in range(len(df.index))]
    df.to_json("all.json", orient="table", index=False)


def merge():
    df1 = pd.read_csv("fas.csv")
    df2 = pd.read_csv("courses1.csv")
    df = pd.merge(df1, df2, how="outer")
    # df["instructors"] = df["instructors"].apply(safe_literal_eval)
    df["uuid"] = [uuid.uuid4().hex for _ in range(len(df.index))]
    df.to_json("all.json", orient="table", index=False)
    df.to_csv("all.csv", index=False)


merge()
