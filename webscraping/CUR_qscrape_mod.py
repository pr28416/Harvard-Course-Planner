import traceback
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
import time
import pickle

# import urllib.parse

URL = "https://qreports.fas.harvard.edu/search/courses?school=FAS"


def save_cookie(driver, path):
    with open(path, "wb") as filehandler:
        pickle.dump(driver.get_cookies(), filehandler)


def load_cookie(driver, path):
    with open(path, "rb") as cookiesfile:
        cookies = pickle.load(cookiesfile)
        for cookie in cookies:
            driver.add_cookie(cookie)


courseStats = ["Overall score", "Materials", "Assignments", "Feedback", "Section"]
courseRatings = [
    "Excellent",
    "Very Good",
    "Good",
    "Fair",
    "Unsatisfactory",
    "Course Mean",
    "FAS Mean",
]


def isFloat(val):
    try:
        float(val)
        return True
    except:
        return False


def qscrape():
    df = pd.read_csv("webscraping/spring2024scrape/coursescrape.csv")
    class_tags = df["class_tag"].values
    class_names = df["class_name"].values
    # print(class_tags)
    options = webdriver.ChromeOptions()
    if not (save := True):
        options.add_argument("-headless")
    driver = webdriver.Chrome(
        # service=FirefoxService(GeckoDriverManager().install()),
        options=options,
    )
    try:
        # driver.add_cookie(
        #     {
        #         "name": "SESSION",
        #         "value": "OGRiZWNmOWMtYmVlOS00OTRkLWI2MmQtYjE0MjI4ZDUzMmIy",
        #         "domain": "qreports.fas.harvard.edu",
        #         "httpOnly": False
        #         # "path": "/",
        #         # "expiry": "Session",
        #     }
        # )
        # driver.get(URL)
        print("Getting url...")
        driver.get("https://qreports.fas.harvard.edu/")
        WebDriverWait(driver, 120).until(
            EC.presence_of_element_located((By.ID, "content-wrapper"))
        )
        # WebDriverWait(driver, 120).until(
        #     EC.presence_of_element_located((By.ID, "dtCourses"))
        # )

        # if save:
        #     driver.get(URL)
        #     input("Hit enter when you're ready to continue...")
        #     save_cookie(driver, "qreport_cookies.txt")
        #     print("Saved cookies to qreport_cookies.txt")
        #     raise
        # else:
        #     load_cookie(driver, "qreport_cookies.txt")
        #     driver.get(URL)

        all_results = []
        # print("Gotten url, starting")
        input("Hit enter when you're ready to continue...")
        for class_tag_idx, class_tag in enumerate(class_tags):
            # if pd.isna(df.iloc[class_tag_idx]["mean_hours"]) or isFloat(
            #     df.iloc[class_tag_idx]["mean_hours"]
            # ):
            #     continue
            # print(
            #     f"On course {class_tag_idx+1} of {len(class_tags)}: {class_tag}",
            #     df.iloc[class_tag_idx]["mean_hours"],
            #     type(df.iloc[class_tag_idx]["mean_hours"]),
            #     pd.api.types.is_numeric_dtype(df.iloc[class_tag_idx]["mean_hours"]),
            # )
            print(f"On course {class_tag_idx+1} of {len(class_tags)}: {class_tag}")
            results = {"class_tag": class_tag}
            try:
                sp = class_tag.split(" ")
                tag, section = (
                    "+".join(sp[:2]) + "-" + class_names[class_tag_idx],
                    "+" + "+".join(sp[2:]) if len(sp) > 2 else "",
                )
                driver.get(URL + "&search=" + "".join([tag, section]))

                WebDriverWait(driver, 120).until(
                    EC.presence_of_element_located((By.ID, "dtCourses"))
                )

                # Get table
                table = driver.find_element(By.ID, "dtCourses")

                # Sort data
                thead = table.find_element(By.TAG_NAME, "thead")
                term = thead.find_elements(By.TAG_NAME, "th")[-1]
                term.click()
                term.click()

                # Get most recent class data
                tbody = table.find_element(By.TAG_NAME, "tbody")
                WebDriverWait(tbody, 120).until(
                    EC.presence_of_element_located((By.TAG_NAME, "tr"))
                )
                row = tbody.find_element(By.TAG_NAME, "tr")
                if row is None or "No matching records found" in row.text:
                    continue

                # Find link
                link = row.find_element(By.TAG_NAME, "a").get_attribute("href")
                driver.get(link)

                # Wait until page loads
                WebDriverWait(driver, 120).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "report-block"))
                )

                # Get course general questions report block
                reports = driver.find_elements(By.CLASS_NAME, "report-block")

                # if False:
                report = reports[2]
                tbody = report.find_element(By.TAG_NAME, "tbody")
                rows = tbody.find_elements(By.TAG_NAME, "tr")

                # Iterate through each row
                for rowIdx, row in enumerate(rows):
                    # Iterate through each cell
                    cells = row.find_elements(By.TAG_NAME, "td")
                    for cellIdx, cell in enumerate(cells):
                        if cellIdx == 0:
                            continue
                        results[
                            f"{courseStats[rowIdx]} {courseRatings[cellIdx-1]}"
                        ] = cell.text

                # Get course hours
                for r in reports:
                    h3 = r.find_element(By.TAG_NAME, "h3").text
                    if "hour" in h3:
                        table = r.find_element(By.TAG_NAME, "table")
                        tbody = table.find_element(By.TAG_NAME, "tbody")
                        results["mean_hours"] = tbody.find_elements(By.TAG_NAME, "tr")[
                            2
                        ].text[5:]
                        break
                else:
                    continue

                # Get course comments
                results["comments"] = []
                try:
                    commentSection = driver.find_element(
                        By.CLASS_NAME, "CommentBlockRow"
                    )
                    comments = commentSection.find_elements(
                        By.CLASS_NAME, "TabularBody_LeftColumn"
                    )
                    for comment in comments:
                        results["comments"].append(comment.text)
                except Exception as e:
                    print("Failed to get comments for course", class_tag, ": ", e)

            except Exception as e:
                print(class_tag, "Inner error:", e)
                traceback.print_exc()
                # raise e
            finally:
                all_results.append(results)

    except Exception as e:
        # raise e
        print("Outer error:", e)
    finally:
        driver.quit()
        sdf = pd.DataFrame.from_records(all_results)
        sdf.to_json(
            "webscraping/spring2024scrape/nqrawdata.json", orient="table", index=False
        )
        # sdf.to_excel("newscrape/nqrawdata.xlsx", index=False)


qscrape()
