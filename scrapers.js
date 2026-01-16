const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function scrapeEvents() {
  const events = [];

  try {
    const insiderEvents = await scrapeInsiderWithPuppeteer();
    events.push(...insiderEvents);
  } catch (error) {
    console.error('Error scraping Insider:', error.message);
  }

  try {
    const allEventsData = await scrapeAllEvents();
    events.push(...allEventsData);
  } catch (error) {
    console.error('Error scraping AllEvents:', error.message);
  }

  try {
    const bookMyShowEvents = await scrapeBookMyShowWithPuppeteer();
    events.push(...bookMyShowEvents);
  } catch (error) {
    console.error('Error scraping BookMyShow:', error.message);
  }

  try {
    const eventbriteEvents = await scrapeEventbrite();
    events.push(...eventbriteEvents);
  } catch (error) {
    console.error('Error scraping Eventbrite:', error.message);
  }

  return events;
}

// Puppeteer-based scrapers for JavaScript-heavy sites

async function scrapeInsiderWithPuppeteer() {
  const events = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.district.in/?city=bengaluru', { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForTimeout(3000);

    const extractedEvents = await page.evaluate(() => {
      const results = [];
      // Use specific selectors found in the page
      const titleElements = document.querySelectorAll('h5.dds-text-lg.dds-font-semibold, h5[class*="dds-text-lg"]');

      titleElements.forEach(titleElem => {
        const parent = titleElem.closest('div').closest('div');
        const linkElem = parent?.querySelector('a');
        const priceElem = parent?.querySelector('[class*="price"], [class*="onwards"]');
        const dateElem = parent?.querySelector('[class*="date"], time');

        const title = titleElem.textContent.trim();

        if (title && title.length > 3) {
          results.push({
            title: title.substring(0, 200),
            venue: 'Bengaluru',
            date: dateElem ? dateElem.textContent.trim() : 'Date TBA',
            description: priceElem ? priceElem.textContent.trim() : 'No description available',
            link: linkElem ? linkElem.href : ''
          });
        }
      });

      return results.slice(0, 20);
    });

    extractedEvents.forEach(event => {
      events.push({
        ...event,
        eventType: 'Art',
        source: 'district.in'
      });
    });

  } catch (error) {
    console.error('District.in Puppeteer error:', error.message);
  } finally {
    if (browser) await browser.close();
  }

  return events;
}

async function scrapeBookMyShowWithPuppeteer() {
  const events = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('https://in.bookmyshow.com/explore/plays-bengaluru', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const extractedEvents = await page.evaluate(() => {
      const results = [];
      const h3Elements = document.querySelectorAll('h3');

      h3Elements.forEach(h3 => {
        const title = h3.textContent.trim();
        const parent = h3.closest('a') || h3.closest('div')?.querySelector('a');
        const link = parent ? parent.href : '';

        if (title && title.length > 5 && title.length < 150 && !title.includes('Sorry')) {
          results.push({
            title: title.substring(0, 200),
            venue: 'Bengaluru',
            date: 'Date TBA',
            description: 'Theatre/Play event',
            link: link
          });
        }
      });

      return results.slice(0, 20);
    });

    extractedEvents.forEach(event => {
      events.push({
        ...event,
        eventType: 'Theater',
        source: 'bookmyshow.com'
      });
    });

  } catch (error) {
    console.error('BookMyShow Puppeteer error:', error.message);
  } finally {
    if (browser) await browser.close();
  }

  return events;
}

// Cheerio-based scrapers for sites that work with simple HTML parsing

async function scrapeAllEvents() {
  const events = [];
  const url = 'https://allevents.in/bangalore/arts';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    $('.event-card, .event-item, [class*="event"]').slice(0, 20).each((i, element) => {
      try {
        const $elem = $(element);
        const title = $elem.find('h2, h3, h4, .title, [class*="title"]').first().text().trim();
        const venue = $elem.find('.venue, .location, [class*="venue"]').first().text().trim();
        const date = $elem.find('.date, .time, [class*="date"]').first().text().trim();
        const description = $elem.find('.description, p').first().text().trim();
        const link = $elem.find('a').first().attr('href');

        if (title && title.length > 3) {
          events.push({
            title: title.substring(0, 200),
            venue: venue || 'Bangalore',
            date: date || 'Date TBA',
            eventType: 'Creative',
            description: description.substring(0, 500) || 'No description available',
            link: link && link.startsWith('http') ? link : (link ? `https://allevents.in${link}` : ''),
            source: 'allevents.in'
          });
        }
      } catch (err) {
        // Skip invalid elements
      }
    });
  } catch (error) {
    console.error('AllEvents scraping error:', error.message);
  }

  return events;
}

async function scrapeEventbrite() {
  const events = [];
  const url = 'https://www.eventbrite.com/d/india--bengaluru/arts/';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    $('[class*="event"], .event-card, article').slice(0, 20).each((i, element) => {
      try {
        const $elem = $(element);
        const title = $elem.find('h2, h3, [class*="title"], [class*="event-name"]').first().text().trim();
        const venue = $elem.find('[class*="venue"], [class*="location"]').first().text().trim();
        const date = $elem.find('[class*="date"], time').first().text().trim();
        const description = $elem.find('p, [class*="description"]').first().text().trim();
        const link = $elem.find('a').first().attr('href');

        if (title && title.length > 3) {
          events.push({
            title: title.substring(0, 200),
            venue: venue || 'Bangalore',
            date: date || 'Date TBA',
            eventType: 'Art',
            description: description.substring(0, 500) || 'No description available',
            link: link && link.startsWith('http') ? link : (link ? `https://www.eventbrite.com${link}` : ''),
            source: 'eventbrite.com'
          });
        }
      } catch (err) {
        // Skip invalid elements
      }
    });
  } catch (error) {
    console.error('Eventbrite scraping error:', error.message);
  }

  return events;
}

module.exports = { scrapeEvents };
