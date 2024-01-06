import { Builder, By, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

async function fetchInstagramPage() {

  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.instagram.com/saraya/');

    await driver.wait(until.elementLocated(By.className('_aagu')), 20000);
    const images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');

    let document = parse(images);
    let imagesSource = document.querySelectorAll('img').map(imgElement => imgElement.getAttribute('src')).join(" \n\n");
    return imagesSource;
  } finally {
    await driver.quit();
  }
}

fetchInstagramPage().then(html => {
  console.log(html)
});
