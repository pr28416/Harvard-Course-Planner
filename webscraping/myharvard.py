import requests, time, datetime, json
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


def test_huid():
    cookies_df = pd.read_json("cookies.json", orient="table")
    options = webdriver.ChromeOptions()
    # options.add_argument("-headless")
    driver = webdriver.Chrome(
        service=ChromeService(ChromeDriverManager().install()),
        options=options,
    )

    # Get list of unique cookie links
    cookie_links = sorted(map(lambda c: c.strip("."), cookies_df["domain"].unique()))
    print(cookie_links)

    # For each unique cookie link, go to the respective link and add all the cookies that fall under this
    for link in cookie_links:
        driver.get("https://" + link if link[:4] != "http" else link)
        for cookie in cookies_df.loc[cookies_df["domain"] == link].to_dict(
            orient="records"
        ):
            print(f"Adding cookie to {link}:", cookie)
            try:
                driver.add_cookie(cookie)
            except Exception as e:
                print(f"({link}) Error adding cookie:", cookie)
                print("Error:", e)

    driver.get("https://my.harvard.edu/")
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )

    driver.get("https://portal.my.harvard.edu/")
    input()


def get_huid():
    options = webdriver.ChromeOptions()
    # options.add_argument("-headless")
    driver = webdriver.Chrome(
        service=ChromeService(ChromeDriverManager().install()),
        options=options,
    )
    driver.get("https://my.harvard.edu/")
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    driver.get("https://portal.my.harvard.edu/")
    input("Press enter to continue")
    # Save cookies
    cookies = driver.get_cookies()
    pd.DataFrame(cookies).to_json("cookies.json", orient="table", index=False)
    print(cookies)


# get_huid()
test_huid()
