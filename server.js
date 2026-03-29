const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TALENTS_FILE = path.join(DATA_DIR, 'talents.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const defaultVideos = [
  {
    name: 'Mombasa Street Dance',
    category: 'Dancer',
    description: 'Short street dance clip with energy and movement.',
    imageData: 'images/dancer.jpg',
    videoData: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    uploadedAt: '2026-03-25T14:00:00Z'
  },
  {
    name: 'Afrobeat Performance',
    category: 'Singer',
    description: 'High-energy Afrobeat sample with lively rhythm.',
    imageData: 'images/singer.jpg',
    videoData: 'https://www.w3schools.com/html/mov_bbb.mp4',
    uploadedAt: '2026-03-24T17:15:00Z'
  },
  {
    name: 'Spoken Word Snippet',
    category: 'Poet',
    description: 'Powerful spoken word example for community voices.',
    imageData: 'images/singer2.jpg',
    videoData: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    uploadedAt: '2026-03-23T09:30:00Z'
  },
  {
    name: 'Quick Beat Session',
    category: 'Producer',
    description: 'Beat-making sample to inspire local producers.',
    imageData: 'images/painter.jpg',
    videoData: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    uploadedAt: '2026-03-22T12:45:00Z'
  },
  {
    name: 'Performance Teaser',
    category: 'Artist',
    description: 'A short teaser showing stage presence and flair.',
    imageData: 'images/singer3.jpg',
    videoData: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    uploadedAt: '2026-03-21T19:10:00Z'
  }
];

function ensurePath(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }
}

function loadTalents() {
  try {
    if (!fs.existsSync(TALENTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TALENTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Failed to read talents file:', error);
    return [];
  }
}

function saveTalents(talents) {
  try {
    fs.writeFileSync(TALENTS_FILE, JSON.stringify(talents, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save talents file:', error);
  }
}

function loadContacts() {
  try {
    if (!fs.existsSync(CONTACTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(CONTACTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Failed to read contacts file:', error);
    return [];
  }
}

function saveContacts(contacts) {
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save contacts file:', error);
  }
}

ensurePath(DATA_DIR);
ensurePath(UPLOADS_DIR);
if (!fs.existsSync(TALENTS_FILE)) {
  saveTalents([]);
}
if (!fs.existsSync(CONTACTS_FILE)) {
  saveContacts([]);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/videos', (req, res) => {
  const talents = loadTalents().filter(item => item.videoData);
  if (talents.length) {
    return res.json(talents);
  }
  return res.json(defaultVideos);
});

app.get('/api/talents', (req, res) => {
  const talents = loadTalents();
  return res.json(talents);
});

app.get('/api/contacts', (req, res) => {
  const contacts = loadContacts();
  return res.json(contacts);
});

app.post('/api/contacts', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const newContact = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    message,
    submittedAt: new Date().toISOString()
  };

  const contacts = loadContacts();
  contacts.unshift(newContact);
  saveContacts(contacts);

  return res.status(201).json({ success: true, contact: newContact });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/api/talents', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'voice', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { name, category, description = '-' } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' });
  }

  const files = req.files || {};
  const photo = files.photo && files.photo[0];
  const voice = files.voice && files.voice[0];
  const video = files.video && files.video[0];

  const newTalent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    category,
    description,
    imageData: photo ? `/uploads/${photo.filename}` : '/images/singer.jpg',
    voiceData: voice ? `/uploads/${voice.filename}` : null,
    videoData: video ? `/uploads/${video.filename}` : null,
    uploadedAt: new Date().toISOString()
  };

  const talents = loadTalents();
  talents.unshift(newTalent);
  saveTalents(talents);

  return res.status(201).json({ success: true, talent: newTalent });
});

app.delete('/api/talents/:id', (req, res) => {
  const { id } = req.params;
  const talents = loadTalents();
  const filtered = talents.filter(item => item.id !== id);
  if (filtered.length === talents.length) {
    return res.status(404).json({ error: 'Talent not found' });
  }
  saveTalents(filtered);
  return res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mombasa Talent Radar backend running on http://localhost:${PORT}`);
});
