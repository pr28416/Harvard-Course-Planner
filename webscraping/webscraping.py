import requests, time, datetime, json, traceback
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.common.exceptions import NoSuchElementException
from webdriver_manager.firefox import GeckoDriverManager

from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

from bs4 import BeautifulSoup
from getHUIDCreds import load_cookie

import uuid


# options = webdriver.ChromeOptions()
# Check if the headless option is set
# is_headless = "--headless" in options.arguments

# print(f"Is headless mode enabled? {is_headless}")

# options = webdriver.FirefoxOptions()
# options.headless = True  # Enable headless mode

# driver = webdriver.Firefox(options=options)  # Create a driver with the headless option


URL = "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22Exclude300%22%3Afalse%2C%22SaveRecent%22%3Atrue%2C%22Facets%22%3A%5B%5D%2C%22PageNumber%22%3A1%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22TopN%22%3A%22%22%2C%22PageSize%22%3A%22%22%2C%22SearchText%22%3A%22*%22%7D"

urls = [
    "https://portal.my.harvard.edu/psp/hrvihprd/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22Exclude300%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22Facets%22%3A%5B%5D%2C%22PageNumber%22%3A1%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22TopN%22%3A%22%22%2C%22PageSize%22%3A%22%22%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22FAS%5C%22)%22%7D",
    # "https://portal.my.harvard.edu/psp/hrvihprd/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22Exclude300%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22Facets%22%3A%5B%5D%2C%22PageNumber%22%3A1%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22TopN%22%3A%22%22%2C%22PageSize%22%3A%22%22%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22NONH%5C%22)%22%7D"
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22Exclude300%22%3Afalse%2C%22SaveRecent%22%3Atrue%2C%22Facets%22%3A%5B%5D%2C%22PageNumber%22%3A1%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22TopN%22%3A%22%22%2C%22PageSize%22%3A%22%22%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22FAS%5C%22)%22%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22GSD%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HBSD%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HBSM%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HGSE%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HSPH%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HDS%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HKS%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HLS%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HMS%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22NONH%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
    # "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22ExcludeBracketed%22%3Atrue%2C%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Atrue%2C%22TopN%22%3A%22%22%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(%20*%20)%20(ACAD_CAREER%3A%5C%22HSDM%5C%22)%22%2C%22DeepLink%22%3Afalse%7D",
]
# URL = "https://courses.my.harvard.edu/psp/courses/EMPLOYEE/EMPL/h/?tab=HU_CLASS_SEARCH&SearchReqJSON=%7B%22PageNumber%22%3A1%2C%22PageSize%22%3A%22%22%2C%22SortOrder%22%3A%5B%22IS_SCL_SUBJ_CAT%22%5D%2C%22Facets%22%3A%5B%5D%2C%22Category%22%3A%22HU_SCL_SCHEDULED_BRACKETED_COURSES%22%2C%22SearchPropertiesInResults%22%3Atrue%2C%22FacetsInResults%22%3Atrue%2C%22SaveRecent%22%3Afalse%2C%22TopN%22%3A%22%22%2C%22ExcludeBracketed%22%3Atrue%2C%22Exclude300%22%3Afalse%2C%22SearchText%22%3A%22(STRM%3A%5C%222238%5C%22)%22%2C%22DeepLink%22%3Afalse%7D"


def parse_description_view(driver):
    result_map = {}
    # Scrape the page
    WebDriverWait(driver, 120).until(
        EC.presence_of_element_located((By.CLASS_NAME, "isSCL_LBWrp"))
    )

    all_html = driver.find_element(By.CLASS_NAME, "isSCL_LBWrp")

    WebDriverWait(all_html, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "isSCL_LBTop"))
    )
    top_html = all_html.find_element(By.CLASS_NAME, "isSCL_LBTop")

    result_map["uuid"] = uuid.uuid4().hex

    # Course name
    try:
        if e := top_html.find_element(By.TAG_NAME, "h2"):
            result_map["class_name"] = e.text.strip(":")
    except NoSuchElementException as e:
        print(e)

    # Course number
    try:
        if e := top_html.find_element(By.TAG_NAME, "h3"):
            result_map["class_tag"] = e.text
    except NoSuchElementException as e:
        print(e)

    print(
        "Starting class:",
        result_map["class_tag"],
        result_map["class_name"],
    )

    # Instructors
    try:
        if e := top_html.find_elements(By.CLASS_NAME, "huSCL_LBInstructors"):
            result_map["instructors"] = list(map(lambda elem: elem.text, e))
    except NoSuchElementException as e:
        print(e)

    # Term
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBTermLabel"):
            result_map["term"] = e.text
    except NoSuchElementException as e:
        print(e)

    # Session
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBSessionLabel"):
            result_map["session"] = e.text
    except NoSuchElementException as e:
        print(e)

    # Class times
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBTime"):
            if "cancelled" in e.text.lower() or "canceled" in e.text.lower():
                # Close the result
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "IS_LB_CLOSE_LINK"))
                )
                close_button = driver.find_element(By.CLASS_NAME, "IS_LB_CLOSE_LINK")
                close_button.click()

                return None
            if "TBA" not in e.text and "cancelled" not in e.text.lower():
                times = e.text.split(" - ")
                if len(times) == 2:
                    result_map["start_time"] = times[0]
                    result_map["end_time"] = times[1]
    except NoSuchElementException as e:
        print(e)

    # Dates
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBClassDateLabel"):
            # Convert date string to datetime object
            (
                result_map["start_date"],
                result_map["end_date"],
            ) = e.text.split(" to ")
    except NoSuchElementException as e:
        print(e)

    # Room info
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBLOC"):
            addr = e.find_element(By.CLASS_NAME, "isSCL_GoogleMap")
            result_map["room"] = (
                e.text.replace("Harvard Maps", "").replace("Google Maps", "").strip()
            )
            result_map["addr"] = addr.get_attribute("href")
    except NoSuchElementException as e:
        print(e)

    # Days of the week
    try:
        if daysBar := top_html.find_element(By.CLASS_NAME, "isSCL_LBRBM"):
            if days := daysBar.find_elements(By.CLASS_NAME, "selected"):
                result_map["days"] = list(map(lambda elem: elem.text, days))
    except NoSuchElementException as e:
        print(e)

    # Course labels
    try:
        if e := top_html.find_element(By.CLASS_NAME, "isSCL_LBINS"):
            if e := e.find_elements(By.TAG_NAME, "li"):
                items = list(map(lambda elem: elem.text.split(":"), e))
                # print(items)
                for key, value in items:
                    result_map["_".join(key.lower().split(" "))] = value
    except NoSuchElementException as e:
        print(e)

    # Course descriptions
    try:
        for e in all_html.find_elements(By.CLASS_NAME, "isSCL_LBDesc"):
            try:
                key = e.find_element(By.TAG_NAME, "h6").text.strip(":")
                # print(key)
                if key == "Jointly Offered with":
                    result_map["joint_offerings"] = list(
                        map(
                            lambda p: p.find_element(By.TAG_NAME, "a").text,
                            e.find_elements(By.TAG_NAME, "p"),
                        )
                    )
                elif key == "Evaluations":
                    if e := e.find_element(By.TAG_NAME, "a"):
                        result_map["q_report"] = e.get_attribute("href")
                else:
                    if e := e.find_elements(By.TAG_NAME, "p"):
                        result_map["_".join(key.lower().split(" "))] = "\n".join(
                            list(map(lambda x: x.text.strip('"'), e))
                        )
            except NoSuchElementException as e:
                print(e)
    except NoSuchElementException as e:
        print(e)

    # All schools attributes
    try:
        if e := all_html.find_element(By.CLASS_NAME, "isSCL_LBAttr"):
            try:
                for li in e.find_elements(By.TAG_NAME, "li"):
                    # print("HERE", li.text)
                    if not li.text:
                        continue
                    idx = li.text.index(":")
                    key, value = li.text[:idx], li.text[idx + 1 :]
                    label = "_".join(key.lower().split(" "))
                    if label == "subject":
                        result_map["subject"] = value
                    else:
                        result_map[label] = (
                            v[0] if len(v := value.split(", ")) == 1 else v
                        )
            except NoSuchElementException as e:
                print(e)
    except NoSuchElementException as e:
        print(e)

    for className in [
        "FAS",
        "HKS",
        "HGSE",
        "GSD",
        "HSPH",
        "HMS",
        "HSDM",
    ]:
        try:
            if e := all_html.find_element(By.CLASS_NAME, f"only{className}"):
                for li in e.find_elements(By.TAG_NAME, "li"):
                    if not li.text:
                        continue
                    idx = li.text.index(":")
                    key, value = li.text[:idx], li.text[idx + 1 :]
                    label = "_".join(key.lower().split(" "))
                    if label == "subject":
                        result_map["subject"] = value
                    else:
                        result_map[label] = (
                            v[0] if len(v := value.split(", ")) == 1 else v
                        )
        except NoSuchElementException as e:
            print(e)

    # Close the result
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "IS_LB_CLOSE_LINK"))
    )
    close_button = driver.find_element(By.CLASS_NAME, "IS_LB_CLOSE_LINK")
    close_button.click()

    return result_map


def selenium_webscrape():
    try:
        parsed_results = []
        # Load the page
        options = webdriver.ChromeOptions()
        # options.add_argument("-headless")
        driver = webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()),
            options=options,
        )
        for url in urls:
            print("Starting URL:", url)
            driver.get(url)

            input("Let me know when to continue: ")
            # Wait until results are loaded
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CLASS_NAME, "isSCL_RBC"))
            )

            # try:
            #     # Assumes first result isn't multi-section
            #     firstResult = driver.find_element(By.CLASS_NAME, "isSCL_ResultItem")
            #     firstResult.click()
            # except:
            #     print("No results found")
            #     continue

            # prevSectionHeader = None

            # while True:
            #     # Parse the description view
            #     try:
            #         result_map = parse_description_view(driver)
            #         if result_map:
            #             parsed_results.append(result_map)
            #     except Exception as e:
            #         print("ERROR:", e)
            #         traceback.print_exc()

            #     # Try to navigate to next section first
            #     try:
            #         section_header = driver.find_element(
            #             By.CLASS_NAME, "huSCL_SectionHdr"
            #         )
            #         prevSectionHeader = section_header.text
            #         next_button = section_header.find_element(
            #             By.CLASS_NAME, "isFSA_PrfHdrNext"
            #         )
            #         next_button.click()
            #         while (
            #             driver.find_element(By.CLASS_NAME, "huSCL_SectionHdr").text
            #             == prevSectionHeader
            #         ):
            #             continue
            #     except:
            #         prevSectionHeader = None
            #         # Navigate to the next result
            #         try:
            #             next_button = driver.find_element(
            #                 By.CLASS_NAME, "isFSA_PrfHdrNext"
            #             )
            #             next_button.click()
            #         except NoSuchElementException:
            #             print("No next button")
            #             break
            #         except Exception as e:
            #             print("ERROR:", e)
            #             traceback.print_exc()
            #             break

            # Get the results as a list
            try:
                while True:
                    WebDriverWait(driver, 120).until(
                        EC.presence_of_element_located(
                            (By.CLASS_NAME, "isSCL_ResultItem")
                        )
                    )
                    # results = driver.find_elements(By.CLASS_NAME, "isSCL_ResultItem")
                    results_container = driver.find_element(
                        By.CLASS_NAME, "isSCL_ResultsBody"
                    )
                    results = results_container.find_elements(By.XPATH, "*")
                    print(list(map(lambda r: r.text[:50], results)))
                    for result in results:
                        # Open the result
                        try:
                            result.click()
                        except:
                            print("Failed; Trying to click again")
                            time.sleep(0.1)
                            result.click()

                        # try:
                        #     result_map = parse_description_view(driver)
                        #     parsed_results.append(result_map)

                        # except Exception as e:
                        #     print("ERROR:", e)
                        #     traceback.print_exc()

                        # Check if multiple sections
                        try:
                            # print("Trying to find element")
                            e = result.find_element(By.CLASS_NAME, "isSCL_Meetings")
                            # print("Found element")
                            if "Multiple Sections" not in e.text:
                                # print("Not multiple section")
                                raise NoSuchElementException()
                            # print("Multiple section")
                            container = result.find_element(
                                By.CLASS_NAME, "huCombinedClassSections"
                            )
                            WebDriverWait(container, 10).until(
                                EC.presence_of_element_located(
                                    (By.CLASS_NAME, "huClassSections")
                                )
                            )
                            # print("Multiple section container found")
                            for subresult in container.find_elements(
                                By.CLASS_NAME, "isSCL_ResultItem"
                            ):
                                # print(subresult.text)
                                subresult.click()
                                result_map = parse_description_view(driver)
                                if result_map is not None:
                                    parsed_results.append(result_map)

                        except NoSuchElementException:
                            result_map = parse_description_view(driver)
                            if result_map is not None:
                                parsed_results.append(result_map)

                        except Exception as e:
                            print("ERROR:", e)
                            traceback.print_exc()

                    print("Finished page")

                    # Navigate to the next page
                    buttonPanel = driver.find_element(
                        By.CLASS_NAME, "isSCL_ResultsPaging"
                    )
                    if button := buttonPanel.find_element(
                        By.CLASS_NAME, "isSCL_RPNext"
                    ):
                        pagination = driver.find_element(
                            By.CLASS_NAME, "isSCL_ResultsPaging"
                        )
                        start_res = int(
                            pagination.find_element(By.TAG_NAME, "h6").text.split(" ")[
                                2
                            ]
                        )
                        WebDriverWait(buttonPanel, 5).until(
                            EC.element_to_be_clickable((By.CLASS_NAME, "isSCL_RPNext"))
                        )
                        button.click()
                        WebDriverWait(pagination, 120).until(
                            EC.text_to_be_present_in_element(
                                (By.TAG_NAME, "h6"), str(start_res + 25)
                            )
                        )
                    else:
                        print("No next page")
                        break
            except Exception as e:
                print("ERROR:", e)
                traceback.print_exc()
                # raise e
                continue
            # else:
            #     break
            # time.sleep(10)
            # for item in html:
            #     print(item.text)
            #     print()
    except Exception as e:
        print("Error:", str(e))
        raise e
    finally:
        driver.quit()
        df = pd.DataFrame.from_records(parsed_results)
        df.to_json("webscraping/spring2024scrape/raw.json", orient="table", index=False)
        two(df)
        pass


def two(df):
    # Merge DataFrames based on the subject
    alt = pd.read_csv("webscraping/CUR_alt_courses.csv")
    merged_df = pd.merge(df, alt, left_on="subject", right_on="subject", how="left")

    # Split the 'class_tag' column to extract course number
    # a = merged_df["class_tag"].str.split(" ", n=1).str
    # print(a)
    # merged_df["course_tag"], merged_df["course_number"] = a
    merged_df["course_number"] = merged_df["class_tag"].str.split(" ").str[-1]

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
    merged_df = merged_df.drop(columns=["ab0", "ab1", "ab2", "course_number"])
    merged_df = merged_df.rename(
        columns={"new_ab0": "ab0", "new_ab1": "ab1", "new_ab2": "ab2"}
    )

    merged_df.to_json(
        "webscraping/spring2024scrape/coursescrape.json", orient="table", index=False
    )
    merged_df.to_csv("webscraping/spring2024scrape/coursescrape.csv", index=False)


# isSCL_RBC
def main():
    driver = webdriver.Firefox()
    driver.get(URL)

    try:
        print("Waiting for page load")
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        print("Searching for element")
        element = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located(
                (By.ID, "ptpgltbody_IS_SCL_CLASS_SEARCH_PGLT")
            )
        )
        print(element.text)
    except Exception as e:
        print("Error:", str(e))
    finally:
        driver.quit()

    # html = driver.find_element(By.ID, "IS_SCL_ResultsPlaceholder")
    # print("Got:", html.text)

    # driver.quit()


# yaaas()
selenium_webscrape()
