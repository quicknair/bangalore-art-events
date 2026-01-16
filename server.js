const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { scrapeEvents } = require('./scrapers');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function deduplicateEvents(existingEvents, newEvents) {
  const existing = new Set(
    existingEvents.map(e => `${e.title.toLowerCase().trim()}-${e.date}`)
  );

  return newEvents.filter(event => {
    const key = `${event.title.toLowerCase().trim()}-${event.date}`;
    return !existing.has(key);
  });
}

// GET all items
app.get('/api/items', (req, res) => {
  const items = readData();
  res.json(items);
});

// GET single item
app.get('/api/items/:id', (req, res) => {
  const items = readData();
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// CREATE new item
app.post('/api/items', (req, res) => {
  const items = readData();
  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

// UPDATE item
app.put('/api/items/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items[index] = {
    ...items[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  writeData(items);
  res.json(items[index]);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const items = readData();
  const filtered = items.filter(i => i.id !== req.params.id);
  if (items.length === filtered.length) {
    return res.status(404).json({ error: 'Item not found' });
  }
  writeData(filtered);
  res.json({ message: 'Item deleted' });
});

// SCRAPE events from the web
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('Starting event scraping...');
    const scrapedEvents = await scrapeEvents();

    if (scrapedEvents.length === 0) {
      return res.json({ message: 'No new events found', added: 0 });
    }

    const existingEvents = readData();
    const uniqueEvents = deduplicateEvents(existingEvents, scrapedEvents);

    const eventsToAdd = uniqueEvents.map(event => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...event,
      createdAt: new Date().toISOString()
    }));

    const allEvents = [...existingEvents, ...eventsToAdd];
    writeData(allEvents);

    console.log(`Added ${eventsToAdd.length} new events`);
    res.json({
      message: `Successfully scraped events`,
      total: scrapedEvents.length,
      added: eventsToAdd.length,
      duplicates: scrapedEvents.length - eventsToAdd.length
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape events', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
