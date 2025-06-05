const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const SCENARIO_DIR = path.join(__dirname, 'scenarios');
const upload = multer({ dest: SCENARIO_DIR });

let scenarios = {};
let defaultScenario = '';

function loadScenarios() {
  scenarios = {};
  if (!fs.existsSync(SCENARIO_DIR)) {
    fs.mkdirSync(SCENARIO_DIR);
  }
  const files = fs.readdirSync(SCENARIO_DIR).filter(f => /\.ya?ml$/i.test(f));
  files.forEach(file => {
    try {
      const data = fs.readFileSync(path.join(SCENARIO_DIR, file), 'utf8');
      const name = path.basename(file, path.extname(file));
      scenarios[name] = yaml.load(data);
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  });
  defaultScenario = files.length
    ? path.basename(files[0], path.extname(files[0]))
    : '';
}

loadScenarios();

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// List available scenarios
app.get('/api/scenarios', (req, res) => {
  res.json({ scenarios: Object.keys(scenarios), default: defaultScenario });
});

// Provide scenario configuration to the frontend
app.get('/api/scenario', (req, res) => {
  const name = req.query.name || defaultScenario;
  const sc = scenarios[name];
  if (!sc) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(sc);
});

// Upload a new scenario file
app.post('/api/scenario/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const scenarioData = yaml.load(data);
    const name = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const destPath = path.join(SCENARIO_DIR, name + path.extname(req.file.originalname));
    fs.renameSync(filePath, destPath);
    scenarios[name] = scenarioData;
    if (!defaultScenario) defaultScenario = name;
    res.json({ success: true, name });
  } catch (err) {
    fs.unlinkSync(filePath);
    console.error('Failed to upload scenario:', err);
    res.status(400).json({ error: 'Invalid scenario file' });
  }
});

// API endpoint to validate answers
app.post('/api/validate', (req, res) => {
  const { deviceId, scenarioName } = req.body;
  const sc = scenarios[scenarioName || defaultScenario];
  if (!sc) {
    return res.status(400).json({ error: 'Invalid scenario' });
  }

  const correctAnswer = sc.validation.correct_answer;
  const isCorrect = deviceId.toUpperCase() === correctAnswer.toUpperCase();

  const feedback = isCorrect
    ? sc.validation.success_feedback
    : sc.validation.failure_feedback;

  res.json({
    correct: isCorrect,
    feedback: feedback,
    correctAnswer: correctAnswer
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Signal-Routing Troubleshooting Exercise running on port ${PORT}`);
});
