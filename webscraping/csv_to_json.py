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
    df.to_json("newscrape/newfas.json", orient="table", index=False)
    df.to_csv("newscrape/newfas.csv", index=False)


def merge():
    df1 = pd.read_json("webscraping/spring2024scrape/coursescrape.json", orient="table")
    df2 = pd.read_json("webscraping/spring2024scrape/nqrawdata.json", orient="table")
    df = pd.merge(df1, df2, how="outer")
    df = df.dropna(subset=["subject"])
    # df["instructors"] = df["instructors"].apply(safe_literal_eval)
    # df["uuid"] = [uuid.uuid4().hex for _ in range(len(df.index))]
    df.to_json("webscraping/spring2024scrape/final.json", orient="table", index=False)
    df.to_csv("webscraping/spring2024scrape/final.csv", index=False)
    # df.to_excel("webscraping/spring2024scrape/final.xlsx", index=False)


def isFloat(value):
    try:
        float(value)
        return True
    except:
        return False


def add_Q_data():
    df1 = pd.read_csv("newscrape/newcombined.csv")
    df2 = pd.read_excel("newscrape/nqrawdata.xlsx")

    for idx, row in df1.iterrows():
        # if pd.isna(row["mean_hours"]) or isFloat(row["mean_hours"]):
        #     continue
        # print()
        # df1.at[idx, "mean_hours"] = df2.loc[df2["class_tag"] == row["class_tag"]]
        corresponding_row = df2[df2["class_tag"] == row["class_tag"]]
        # print(corresponding_row)
        if not corresponding_row.empty:
            new_mean_hours = corresponding_row["mean_hours"].values[0]
            df1.at[idx, "mean_hours"] = new_mean_hours

    # df = pd.merge(df1, df2, how="outer")
    df1 = df1.sort_values(by=["class_tag", "class_name"])
    df1.to_json("newscrape/nqfinal.json", orient="table", index=False)
    df1.to_excel("newscrape/nqfinal.xlsx", index=False)


merge()
# add_Q_data()
# main()
