import { Builder, By, Condition, Key, promise, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';
import readline from 'readline';
import { resolve } from 'path';
import { rejects } from 'assert';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let cdnLinks = new Set();
let numberOfPosts;
let totalPosts;
let instagramProfile;
let userName;

async function progressBar(min, max) {
  console.clear();
  let progress = Math.floor((min.size / max) * 100);
  console.log("Profile:", userName)
  console.log("Scraping posts: " + progress + "%")
  if (+progress === 100) {
    console.log("Scraping complete!!");
  }
}

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
    } catch (error) { }

    await progressBar(cdnLinks, totalPosts);

    await scrollDown(driver);

  }
}

async function fetchInstagramPage() {

  return new Promise((resolve, rejects) => {
    console.clear();
    rl.question("Enter profile link: ", async (answer) => {
      instagramProfile = answer;

      rl.close();

      const driver = await new Builder().forBrowser('chrome').build();

      try {
        await driver.get(`${instagramProfile}`);

        await driver.wait(until.elementLocated(By.className('_aagu')), 30000);

        let endLoginBanner = await driver.findElement(By.className('_abn5'));
        endLoginBanner.click();

        let showMorePosts = await driver.findElement(By.className('_any9'));
        showMorePosts.click();

        let posts = await driver.findElement(By.tagName('ul')).getAttribute('innerText');
        numberOfPosts = posts.split(" ")[0];
        totalPosts = +numberOfPosts;

        userName = await driver.findElement(By.className('xvs91rp')).getAttribute('innerText');

        await progressBar(cdnLinks, totalPosts);
        await scrollDown(driver);
        await getImages(driver);

        resolve(cdnLinks)
      } finally {
        progressBar(cdnLinks, totalPosts);
        await driver.quit();
      }
    });
  })
}

fetchInstagramPage().then(html => {
  console.log(html)
});
