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
import pickle


def save_cookie(driver, path):
    with open(path, "wb") as filehandler:
        pickle.dump(
            # list(
            #     filter(
            #         lambda cookie: cookie["domain"] == ".my.harvard.edu",
            #         driver.get_cookies(),
            #     )
            # ),
            driver.get_cookies(),
            filehandler,
        )


def load_cookie(driver, path):
    with open(path, "rb") as cookiesfile:
        cookies = pickle.load(cookiesfile)
        # cookies.sort(key=lambda cookie: cookie["domain"])
        # p = None
        # for cookie in cookies:
        #     print("Adding cookie:", cookie["name"], cookie["domain"])
        #     if cookie["domain"] != p:
        #         e = cookie["domain"].strip(".")
        #         if e == "my.harvard.edu":
        #             link = "https://portal.my.harvard.edu/404"
        #         else:
        #             link = "https://" + e
        #         print("Going to link:", link)
        #         WebDriverWait(driver, 120).until(
        #             EC.presence_of_element_located((By.TAG_NAME, "body"))
        #         )
        #         p = cookie["domain"]
        #     driver.add_cookie(cookie)
        driver.get("https://portal.my.harvard.edu/")
        WebDriverWait(driver, 120).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        for cookie in filter(lambda c: c["domain"] == "portal.my.harvard.edu", cookies):
            driver.add_cookie(cookie)


if __name__ == "__main__":
    options = webdriver.ChromeOptions()
    # options.add_argument("-headless")
    driver = webdriver.Chrome(
        # service=FirefoxService(GeckoDriverManager().install()),
        options=options,
    )
    driver.get("https://my.harvard.edu/")
    WebDriverWait(driver, 120).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    input("Press enter after logging in")
    save_cookie(driver, "myharvard.pkl")
    print("Saved cookies to myharvard.pkl")
    driver.quit()
