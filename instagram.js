import { Builder, By, Condition, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

let cdnLinks = new Set();

async function getImages(driver) {
  let images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
      let document = parse(images)

      document.querySelectorAll('img').map(imgElement => {
        let links = imgElement.getAttribute('src')
        cdnLinks.add(links)
      })
}

async function scrollDown(driver) {
  await driver.sleep(4000)

  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
  await driver.sleep(4000);

  let numberOfPosts = await driver.findElement(By.tagName('ul')).getAttribute('innerText');
  if(cdnLinks.length !== numberOfPosts.split(" ")[0]){
    do{
      
      driver.executeScript(`let dragEvent = null`);
      
      try {
        let element = await driver.findElement(By.className('xzkaem6'));
        if (element) {
          console.log('found it')
          await driver.executeScript(`document.querySelectorAll("div")[491].hidden = true;`);
        } else {
          console.log("Element not found");
        }
      } catch (error) {
        console.log("Error finding element:", error.message);
      }

      await scrollDown(driver);
      await getImages(driver);

    } while (cdnLinks.length !== numberOfPosts.split(" ")[0] - 1)
  }
}

async function fetchInstagramPage() {

  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.instagram.com/saraya/');

    await driver.wait(until.elementLocated(By.className('_aagu')), 30000);

      let endLoginBanner = await driver.findElement(By.className('_abn5 '));
      endLoginBanner.click();

      let showMorePosts = await driver.findElement(By.className('_any9'));
      showMorePosts.click();

      await scrollDown(driver);
      await getImages(driver);
      


  } finally {
    await driver.quit();
    return cdnLinks
  }
}

fetchInstagramPage().then(html => {
  console.log(html)
});

