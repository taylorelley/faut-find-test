const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
const PORT = process.env.PORT || 3000;

// Load scenario configuration
let scenario = {};
try {
  const data = fs.readFileSync(path.join(__dirname, 'scenario.yaml'), 'utf8');
  scenario = yaml.load(data);
} catch (err) {
  console.error('Failed to load scenario.yaml', err);
  process.exit(1);
}

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to provide scenario configuration to the frontend
app.get('/api/scenario', (req, res) => {
  res.json(scenario);
});

// API endpoint to validate answers
app.post('/api/validate', (req, res) => {
  const { deviceId } = req.body;

  const correctAnswer = scenario.validation.correct_answer;
  const isCorrect = deviceId.toUpperCase() === correctAnswer.toUpperCase();

  const feedback = isCorrect
    ? scenario.validation.success_feedback
    : scenario.validation.failure_feedback;

  res.json({
    correct: isCorrect,
    feedback: feedback,
    correctAnswer: correctAnswer
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Signal-Routing Troubleshooting Exercise running on port ${PORT}`);
});
