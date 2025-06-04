const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to validate answers
app.post('/api/validate', (req, res) => {
  const { deviceId, reasoning } = req.body;
  
  const correctAnswer = 'TF2';
  const isCorrect = deviceId.toUpperCase() === correctAnswer;
  
  let feedback = '';
  if (isCorrect) {
    feedback = 'Correct! TF2 (ThetaFire-B) is indeed the faulty device. Since all pings succeed (including ZS→TF1, TF1→TF2, TF2→KS) and all dynamic requests work through the shared upstream path, the problem must be TF2\'s internal policy dropping all static traffic despite being reachable.';
  } else {
    feedback = `Incorrect. The faulty device is ${correctAnswer}. Key insight: Dynamic requests work end-to-end through AS→BH→GC→ZS→DG→EB→IC→EM→KS, proving all those devices work. Static requests fail in the ZS→TF1→TF2→KS path, but all hops respond to ping. This points to TF2's internal filtering logic being broken.`;
  }
  
  res.json({
    correct: isCorrect,
    feedback: feedback,
    correctAnswer: correctAnswer
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Signal Routing Troubleshooter running on port ${PORT}`);
});
