import requests
from bs4 import BeautifulSoup
import time
import json

url = "https://www.e-flux.com/journal/"
issue_url = url
# maxIssue = 1
maxIssue = 149

data = []

r = requests.get(url)
soup = BeautifulSoup(r.text, "html.parser")

def get_issue(url):
    issues_num = 143
    while issues_num <= maxIssue:
        if (issues_num < 10):
            issue_url = url + "0" + str(issues_num) + "/"
            # print(issue_url)
        else:
            issue_url = url + str(issues_num) + "/"
            # print(issue_url)

        # PREPARE SOUP FOR EACH ISSUE
        issue_r = requests.get(issue_url)
        issue_soup = BeautifulSoup(issue_r.text, "html.parser")
        #GET EDITORIAL ARTICLES
        get_editorial(issue_soup, issues_num)
        
        time.sleep(2)
        issues_num += 1
    

def get_editorial(soup, issues_num):
    #GET EDITORIAL PAGE FROM ISSUE
    edi_btn = soup.find('a', string="Read more from the Editorial")
    href = edi_btn['href'] if edi_btn else None
    edi_href = "https://www.e-flux.com" + href

    edi_page = requests.get(edi_href)
    edi_soup = BeautifulSoup(edi_page.text, "html.parser")

    #GET EDITORIAL CONTENT
    article_body = edi_soup.find('div', class_='article__body')
    # editorial_txt = article_body.find_all('p') if article_body else []
    # editorial_txt = edi_soup.select('p').get_text(strip=True)
    # Extract all <p> tags within this <div>
    paragraphs = article_body.find_all('p') if article_body else []

    # Get the text content only (no tags)
    editorial_txt = ''
    for p in paragraphs:
        editorial_txt += p.get_text(strip=True) + " "
        # print(p.get_text(strip=True))
    # editorial_txt = [p.get_text(strip=True) for p in paragraphs]

    #APPEND DATA
    data.append({
        "title": "Issue #" + str(issues_num) + " Editorial",
        "content": editorial_txt
    })

    #GET JOURNAL ARTICLES
    article_urls = get_all_journal_links(soup)
    for url in article_urls:
        url = "https://www.e-flux.com" + url
        get_journal_content(url)
        time.sleep(2)

    print(issues_num)
    # file_name = 
    with open("eflux-articles_" + str(issues_num) + ".json", "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def get_all_journal_links(soup):
    #GET EACH JOURNALARTICLE DIV
    article_tag = soup.select('div.button-wrap--journalarticle-more a')
    article_urls = [link['href'] for link in article_tag]
    return article_urls
    # print(article_urls)

def get_journal_content(url):
    #PREPARE SOUP FOR JOUNAL
    journal_r = requests.get(url)
    journal_soup = BeautifulSoup(journal_r.text, "html.parser")

    #TITLE
    h1_tag = journal_soup.select('h1.article__header-title')
    for h1 in h1_tag:
        title = h1.get_text(strip=True) if h1_tag else None
    # title = journal_soup.select(".article__header-title")
    # title = [h1.get_text(strip=True) for h1 in h1_tag]
    # print(title)

    #CONTENT
    content_div = journal_soup.select('.article__body')
    content = ''
    for c in content_div:
        content += c.get_text(strip=True) + " "
    # print(content)

    #APPEND DATA
    data.append({
        "title": title,
        "content": content
    })

get_issue(url)
# print(data)
