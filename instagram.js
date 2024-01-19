import { Builder, By, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

async function fetchInstagramPage() {

  let cdnLinks  = new Set();

  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.instagram.com/saraya/');

    await driver.wait(until.elementLocated(By.className('_aagu')), 30000);
    
      let images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
      let document = parse(images)

      document.querySelectorAll('img').map(imgElement => {
        let links = imgElement.getAttribute('src')
        cdnLinks.add(links)
      })

      let endLoginBanner = await driver.findElement(By.className('_abn5 '));
      endLoginBanner.click();

      let showMorePosts = await driver.findElement(By.className('_any9'));
      showMorePosts.click();
      
      let images2 = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
      let document2 = parse(images2)

      document2.querySelectorAll('img').map(imgElement => {
        let links = imgElement.getAttribute('src')
        cdnLinks.add(links)
      })
      

    return cdnLinks;
  } finally {
    await driver.quit();
  }
}

fetchInstagramPage().then(html => {
  console.log(html)
});
