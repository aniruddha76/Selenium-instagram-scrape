import { Builder, By, Condition, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

let cdnLinks = new Set();
let numberOfPosts;
let totalPosts;

async function getImages(driver) {
  let images = await driver.findElement(By.tagName('article')).getAttribute('outerHTML');
  let document = parse(images)

  document.querySelectorAll('img').map(imgElement => {
    let links = imgElement.getAttribute('src');
    cdnLinks.add(links);
  })
}

async function scrollDown(driver) {

  await driver.sleep(3000);
  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)') || await driver.executeScript('document.querySelector("footer").scrollIntoView()');
  await getImages(driver);
  await driver.sleep(3000);

  if (cdnLinks.size < totalPosts) {
    try {
      let element = await driver.findElement(By.className('xzkaem6'));

      if (element) {
        await driver.executeScript(`document.querySelector(".x1n2onr6.xzkaem6").remove()`);
        await driver.executeScript(`document.querySelector("footer").scrollIntoView()`);
      }
    } catch (error) {}

    await getImages(driver);
    await driver.sleep(1000);

    await scrollDown(driver);
  }
}

async function fetchInstagramPage() {

  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.instagram.com/saraya/');

    await driver.wait(until.elementLocated(By.className('_aagu')), 30000);

    let endLoginBanner = await driver.findElement(By.className('_abn5'));
    endLoginBanner.click();

    let showMorePosts = await driver.findElement(By.className('_any9'));
    showMorePosts.click();

    let posts = await driver.findElement(By.tagName('ul')).getAttribute('innerText');
    numberOfPosts = posts.split(" ")[0];
    totalPosts = +numberOfPosts;

    await scrollDown(driver);
    await getImages(driver);

  } finally {
    await driver.quit();
  }

  return cdnLinks;
}

fetchInstagramPage().then(html => {
  console.log(html)
});