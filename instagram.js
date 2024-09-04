import { Builder, By, Condition, Key, promise, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';
import readline from 'readline';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import https from 'https';

let chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let cdnLinks = new Set();
let numberOfPosts;
let totalPosts;
let instagramProfile;
let userName;
let loadingElement;

async function progressBar(cdnLinks, totalPosts) {
  console.clear();
  console.log("Profile name:", userName, "\nTotal posts:", totalPosts);
  console.log("Mining Status:", cdnLinks.size, "Posts extracted..")
  if (cdnLinks.size == totalPosts) {
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
  await getImages(driver);
  await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)') || await driver.executeScript('document.querySelector("footer").scrollIntoView()');

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

    loadingElement = await driver.findElements(By.className('_aanh'));
    if (await loadingElement.length === 0) {
      return cdnLinks;
    } else {
      await scrollDown(driver);
    }
  }
}

async function fetchInstagramPage() {

  return new Promise((resolve, rejects) => {
    console.clear();
    rl.question("Enter Username: ", async (answer) => {
      instagramProfile = "https://www.instagram.com/" + answer;

      rl.close();

      const driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

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

        async function downloadPosts() {
          const downloadFolderPath = `./${userName}` + "/";
          if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath);
          }

          for (let link of cdnLinks) {
            async function download(url, path) {
              let localPath = await fs.createWriteStream(path);

              let request = await https.get(url, async function (response) {
                await response.pipe(localPath);
              })
            }
            await download(link, downloadFolderPath + Date.now() + ".jpg")
          }
        }
        downloadPosts()

        resolve(cdnLinks);
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
