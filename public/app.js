const API_URL = 'http://localhost:3000/api/items';

let editingItemId = null;

const form = document.getElementById('item-form');
const titleInput = document.getElementById('item-title');
const venueInput = document.getElementById('item-venue');
const dateInput = document.getElementById('item-date');
const typeInput = document.getElementById('item-type');
const descriptionInput = document.getElementById('item-description');
const linkInput = document.getElementById('item-link');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const itemsList = document.getElementById('items-list');
const scrapeBtn = document.getElementById('scrape-btn');
const scrapeStatus = document.getElementById('scrape-status');

async function fetchItems() {
  const response = await fetch(API_URL);
  const items = await response.json();
  renderItems(items);
}

function renderItems(items) {
  if (items.length === 0) {
    itemsList.innerHTML = '<div class="empty-state">No events yet. Add one above or fetch from the web!</div>';
    return;
  }

  itemsList.innerHTML = items.map(item => `
    <div class="item" data-id="${item.id}">
      <div class="item-header">
        <div class="item-title">${escapeHtml(item.title)}</div>
        <div class="item-actions">
          <button class="edit-btn" onclick="editItem('${item.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
        </div>
      </div>

      <div class="item-info">
        ${item.eventType ? `<span class="item-type">${escapeHtml(item.eventType)}</span>` : ''}
        ${item.venue ? `<div class="item-venue">${escapeHtml(item.venue)}</div>` : ''}
        ${item.date ? `<div class="item-date">${escapeHtml(item.date)}</div>` : ''}
      </div>

      ${item.description ? `<div class="item-description">${escapeHtml(item.description)}</div>` : ''}

      ${item.link ? `<div class="item-link"><a href="${escapeHtml(item.link)}" target="_blank">Event Link →</a></div>` : ''}

      ${item.source ? `<div class="item-source">Source: ${escapeHtml(item.source)}</div>` : ''}
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const venue = venueInput.value.trim();
  const date = dateInput.value.trim();
  const eventType = typeInput.value;
  const description = descriptionInput.value.trim();
  const link = linkInput.value.trim();

  if (!title || !venue || !date || !eventType || !description) return;

  const item = { title, venue, date, eventType, description, link };

  if (editingItemId) {
    await fetch(`${API_URL}/${editingItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    editingItemId = null;
    submitBtn.textContent = 'Add Event';
    cancelBtn.style.display = 'none';
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  }

  titleInput.value = '';
  venueInput.value = '';
  dateInput.value = '';
  typeInput.value = '';
  descriptionInput.value = '';
  linkInput.value = '';
  fetchItems();
});

cancelBtn.addEventListener('click', () => {
  editingItemId = null;
  titleInput.value = '';
  venueInput.value = '';
  dateInput.value = '';
  typeInput.value = '';
  descriptionInput.value = '';
  linkInput.value = '';
  submitBtn.textContent = 'Add Event';
  cancelBtn.style.display = 'none';
});

async function editItem(id) {
  const response = await fetch(`${API_URL}/${id}`);
  const item = await response.json();

  titleInput.value = item.title;
  venueInput.value = item.venue || '';
  dateInput.value = item.date || '';
  typeInput.value = item.eventType || '';
  descriptionInput.value = item.description || '';
  linkInput.value = item.link || '';
  editingItemId = id;
  submitBtn.textContent = 'Update Event';
  cancelBtn.style.display = 'block';
  titleInput.focus();
}

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this event?')) {
    return;
  }

  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  fetchItems();
}

scrapeBtn.addEventListener('click', async () => {
  scrapeBtn.disabled = true;
  scrapeStatus.textContent = 'Fetching events...';

  try {
    const response = await fetch('http://localhost:3000/api/scrape', {
      method: 'POST'
    });
    const result = await response.json();

    if (response.ok) {
      scrapeStatus.textContent = `✓ Found ${result.total} events, added ${result.added} new (${result.duplicates} duplicates skipped)`;
      fetchItems();
      setTimeout(() => {
        scrapeStatus.textContent = '';
      }, 5000);
    } else {
      scrapeStatus.textContent = `✗ Error: ${result.error}`;
    }
  } catch (error) {
    scrapeStatus.textContent = `✗ Failed to fetch events`;
    console.error(error);
  } finally {
    scrapeBtn.disabled = false;
  }
});

fetchItems();
