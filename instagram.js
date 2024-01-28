import { Builder, By, Condition, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

let cdnLinks = new Set();
let numberOfPosts;
let totalPosts;

async function getImages(driver) {
  let images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
  let document = await parse(images)

  await document.querySelectorAll('img').map(imgElement => {
    let links = imgElement.getAttribute('src');
    cdnLinks.add(links);
  })

  console.log(cdnLinks.size)
}

async function scrollDown(driver) {

  await driver.sleep(4000);
  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
  await getImages(driver);
  await driver.sleep(4000);

  if (cdnLinks.length !== totalPosts) {
    console.log(totalPosts)
    // do {

    //   driver.executeScript(`let dragEvent = null`);

    //   try {
    //     let element = await driver.findElement(By.className('xzkaem6'));

    //     if (element) {
    //       driver.executeScript(`document.querySelector(".x1n2onr6.xzkaem6").remove()`);

    //       await scrollDown(driver);
          await getImages(driver);
          await driver.sleep(4000);
        // }

      // } catch(error) {
      //   console.log("Error finding element:", error.message);
      // }
  
      await scrollDown(driver);
      // await getImages(driver);

    // } while (cdnLinks.length !== numberOfPosts - 1)
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

    let posts = await driver.findElement(By.tagName('ul')).getAttribute('innerText');
    numberOfPosts = posts.split(" ")[0];
    totalPosts = Number(numberOfPosts);

    await driver.executeScript(`document.querySelectorAll("link").forEach(item => {if(item.rel != "stylesheet"){console.log(item); item.remove()}})`);

    await scrollDown(driver);
    await getImages(driver);

  } finally {
    await driver.quit();
  }
  
  console.log(totalPosts)
  return cdnLinks;
}

fetchInstagramPage().then(html => {
  console.log(html)
});