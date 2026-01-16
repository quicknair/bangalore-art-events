const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeEvents() {
  const events = [];

  try {
    const insiderEvents = await scrapeInsider();
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
    const bookMyShowEvents = await scrapeBookMyShow();
    events.push(...bookMyShowEvents);
  } catch (error) {
    console.error('Error scraping BookMyShow:', error.message);
  }

  try {
    const timeoutEvents = await scrapeTimeout();
    events.push(...timeoutEvents);
  } catch (error) {
    console.error('Error scraping Timeout:', error.message);
  }

  try {
    const eventbriteEvents = await scrapeEventbrite();
    events.push(...eventbriteEvents);
  } catch (error) {
    console.error('Error scraping Eventbrite:', error.message);
  }

  return events;
}

async function scrapeInsider() {
  const events = [];
  const url = 'https://insider.in/bangalore/arts';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    $('.event-card, .card-event, [class*="event"]').slice(0, 20).each((i, element) => {
      try {
        const $elem = $(element);
        const title = $elem.find('h2, h3, .event-title, [class*="title"]').first().text().trim();
        const venue = $elem.find('.venue, .location, [class*="venue"], [class*="location"]').first().text().trim();
        const date = $elem.find('.date, .time, [class*="date"]').first().text().trim();
        const description = $elem.find('.description, p').first().text().trim();
        const link = $elem.find('a').first().attr('href');

        if (title && title.length > 3) {
          events.push({
            title: title.substring(0, 200),
            venue: venue || 'Bangalore',
            date: date || 'Date TBA',
            eventType: 'Art',
            description: description.substring(0, 500) || 'No description available',
            link: link && link.startsWith('http') ? link : (link ? `https://insider.in${link}` : ''),
            source: 'insider.in'
          });
        }
      } catch (err) {
        // Skip invalid elements
      }
    });
  } catch (error) {
    console.error('Insider scraping error:', error.message);
  }

  return events;
}

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

async function scrapeBookMyShow() {
  const events = [];
  const url = 'https://in.bookmyshow.com/explore/home/bengaluru';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    $('[class*="event"], [class*="Event"], .event-card, .card').slice(0, 20).each((i, element) => {
      try {
        const $elem = $(element);
        const title = $elem.find('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"]').first().text().trim();
        const venue = $elem.find('[class*="venue"], [class*="Venue"], [class*="location"]').first().text().trim();
        const date = $elem.find('[class*="date"], [class*="Date"], [class*="time"]').first().text().trim();
        const description = $elem.find('p, [class*="description"]').first().text().trim();
        const link = $elem.find('a').first().attr('href');

        if (title && title.length > 3) {
          events.push({
            title: title.substring(0, 200),
            venue: venue || 'Bangalore',
            date: date || 'Date TBA',
            eventType: 'Performance',
            description: description.substring(0, 500) || 'No description available',
            link: link && link.startsWith('http') ? link : (link ? `https://in.bookmyshow.com${link}` : ''),
            source: 'bookmyshow.com'
          });
        }
      } catch (err) {
        // Skip invalid elements
      }
    });
  } catch (error) {
    console.error('BookMyShow scraping error:', error.message);
  }

  return events;
}

async function scrapeTimeout() {
  const events = [];
  const url = 'https://www.timeout.com/bangalore/things-to-do/art-events-in-bangalore';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    $('article, .card, [class*="event"]').slice(0, 20).each((i, element) => {
      try {
        const $elem = $(element);
        const title = $elem.find('h2, h3, h4, [class*="title"]').first().text().trim();
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
            link: link && link.startsWith('http') ? link : (link ? `https://www.timeout.com${link}` : ''),
            source: 'timeout.com'
          });
        }
      } catch (err) {
        // Skip invalid elements
      }
    });
  } catch (error) {
    console.error('Timeout scraping error:', error.message);
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
