import pandas as pd

df = pd.read_csv("fas.csv")
alt = pd.read_csv("alt_courses.csv")


def one():
    unique = {}
    for index, row in df.iterrows():
        # if index < 6:
        #     print(row["subject"], row["class_tag"].split(" ")[0])
        a = row["subject"]
        if a[0] == "[":
            a = a.replace("[", "").replace("]", "").replace("'", "")
        unique[a] = row["class_tag"].split(" ")[0]

    for k, v in unique.items():
        print(k, "\t:", v)


def two():
    # Merge DataFrames based on the subject
    merged_df = pd.merge(df, alt, left_on="subject", right_on="subject", how="left")

    # Split the 'class_tag' column to extract course number
    merged_df["course_tag"], merged_df["course_number"] = (
        merged_df["class_tag"].str.split(" ", 1).str
    )

    # Create new columns with alternative abbreviations
    merged_df["new_ab0"] = merged_df.apply(
        lambda row: f'{row["ab0"]} {row["course_number"]}'
        if not pd.isna(row["ab0"]) and row["ab0"] != " "
        else row["class_tag"],
        axis=1,
    )
    merged_df["new_ab1"] = merged_df.apply(
        lambda row: f'{row["ab1"]} {row["course_number"]}'
        if not pd.isna(row["ab1"]) and row["ab1"] != " "
        else row["class_tag"],
        axis=1,
    )
    merged_df["new_ab2"] = merged_df.apply(
        lambda row: f'{row["ab2"]} {row["course_number"]}'
        if not pd.isna(row["ab2"]) and row["ab2"] != " "
        else row["class_tag"],
        axis=1,
    )

    # Drop and rename columns as needed
    merged_df = merged_df.drop(
        columns=["ab0", "ab1", "ab2", "course_tag", "course_number"]
    )
    merged_df = merged_df.rename(
        columns={"new_ab0": "ab0", "new_ab1": "ab1", "new_ab2": "ab2"}
    )

    merged_df.to_csv("combined.csv", index=False)


two()
