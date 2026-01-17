# Bangalore Art & Creative Events Repository

A web application that tracks and aggregates art and creative events happening in Bangalore. Features manual event entry and automated web scraping to keep the repository continuously updated.

## Features

- **Manual Event Management**: Create, read, update, and delete events with full details
- **Automated Web Scraping**: Fetch events from popular event platforms with one click
- **Smart Deduplication**: Automatically filters out duplicate events
- **Event Details**: Track event name, venue, date/time, type, description, and links
- **Clean UI**: Modern, responsive interface with event cards
- **File-based Storage**: No database required - everything stored in JSON

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Web Scraping**: Axios + Cheerio
- **Storage**: JSON file

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Adding Events Manually
1. Fill in the event form with all required details
2. Click "Add Event" to save

### Fetching Events from Web
1. Click the "Fetch New Events from Web" button
2. The app will scrape event websites and add new events automatically
3. Duplicates are automatically filtered out

### Managing Events
- **Edit**: Click the Edit button on any event card
- **Delete**: Click the Delete button to remove an event

## File Structure

```
my-first-app/
├── public/
│   ├── index.html      # Main page with form and event display
│   ├── styles.css      # Event card styling
│   └── app.js          # Frontend logic and API calls
├── server.js           # Backend API with scraping endpoint
├── scrapers.js         # Web scraping logic for event sources
├── data.json           # Event storage
├── package.json        # Dependencies
└── README.md           # This file
```

## API Endpoints

- `GET /api/items` - Get all events
- `GET /api/items/:id` - Get single event
- `POST /api/items` - Create new event
- `PUT /api/items/:id` - Update event
- `DELETE /api/items/:id` - Delete event
- `POST /api/scrape` - Trigger web scraping to fetch new events

## Event Sources

Currently scrapes from **3 platforms**:
- **district.in** (formerly insider.in) - Events in Bengaluru (Puppeteer)
- **allevents.in** - Arts section for Bangalore
- **eventbrite.com** - Arts events in Bengaluru

Uses Puppeteer for JavaScript-heavy sites and Cheerio for static HTML parsing.

Additional sources can be easily added by extending `scrapers.js`.

## Development

The app runs on port 3000 by default. Events persist in `data.json`. The scraping function is triggered manually via the admin button and automatically deduplicates events based on title and date.
