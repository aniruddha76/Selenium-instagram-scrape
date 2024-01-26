import { Builder, By, Condition, Key, until } from 'selenium-webdriver';
import { parse } from 'node-html-parser';

let cdnLinks = new Set();
let numberOfPosts = 0;

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

  // let numberOfPosts = await driver.findElement(By.tagName('ul')).getAttribute('innerText');
  if (cdnLinks.size < numberOfPosts) {
    do {

      driver.executeScript(`let dragEvent = null`);

      try {
        let element = await driver.findElement(By.className('xzkaem6'));
        if (element) {
          scrollDown(driver);
          
          driver.executeScript(`document.querySelector(".x1n2onr6.xzkaem6").style.display = "none"`);
          await getImages(driver);
        }

      } catch (error){
        // console.log("Error finding element:", error.message);
      }
      console.log( {fetched:cdnLinks.size,numberOfPosts });

      await getImages(driver);
      await scrollDown(driver);

    } while (cdnLinks.size < numberOfPosts)
  }
}

async function fetchInstagramPage() {

  const driver = await new Builder().forBrowser('chrome').build();



  try {
  // Loading Cookie
    // await driver.get('https://www.instagram.com/');
    // await driver.manage().addCookie({name:"sessionid",value:"ADD YOU COOKIE"})
    // await driver.navigate().refresh();

    await driver.get('https://www.instagram.com/saraya/');
    await driver.wait(until.elementLocated(By.className('_aagu')), 30000);

    let endLoginBanner = await driver.findElement(By.className('_abn5 '));
    endLoginBanner.click();

    let showMorePosts = await driver.findElement(By.className('_any9'));
    showMorePosts.click();

  }
  catch(error){
    console.log(error.message)
  }

  numberOfPosts = (await driver.findElement(By.tagName('ul')).getAttribute('innerText')).split(" ")[0] - 1;

  try {
    await scrollDown(driver);
    await getImages(driver);
  } catch (error) {
    console.log(error)
  }   finally {
    await driver.quit();
    return cdnLinks
  }
}

fetchInstagramPage().then(html => {
  console.log(html)
});

