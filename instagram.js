import { Builder, By, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

let button;

async function fetchInstagramPage() {

  let cdnLinks = new Set();

  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.instagram.com/saraya/');

    await driver.wait(until.elementLocated(By.className('_aagu')), 30000);

    let numberOfPosts = (await driver.findElement(By.tagName('li')).getAttribute('innerText')).split(" ")[0];
    button = await driver.findElement(By.className('_any9'))
    let buttonText = await driver.findElement(By.className('_any9')).getAttribute('innerText');

    async function getUrls() {
      let images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
      let document = parse(images)

      document.querySelectorAll('img').map(imgElement => {
        let links = imgElement.getAttribute('src')
        cdnLinks.add(links)
      })
    }

    await new Promise((resolve) => {
      getUrls().then(() => resolve());
    });

    if (buttonText.includes("Show")) {
      button.click();
      getUrls();
    }

    return cdnLinks;
  } finally {
    await driver.quit();
  }
}

fetchInstagramPage().then(html => {
  console.log(html)
});
