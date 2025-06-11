const { OpenAI } = require('openai');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Vercel serverless handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method with multipart/form-data' });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Form parsing error', details: err });
    }

    const file = files.audio?.[0];
    if (!file) {
      return res.status(400).json({ error: 'Missing audio file (field: audio)' });
    }

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: 'whisper-1'
      });

      res.status(200).json({ text: transcription.text });
    } catch (err) {
      console.error('OpenAI Whisper error:', err);
      res.status(500).json({ error: 'Whisper API failed', details: err.message });
    }
  });
};
