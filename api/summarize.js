const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method with a JSON body' });
  }

  const { transcript } = req.body;

  if (!transcript || transcript.length < 20) {
    return res.status(400).json({ error: 'Transcript text is required and must be > 20 characters' });
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant IA spécialisé dans les comptes-rendus de réunions. Génère un résumé structuré, clair, en français avec les points clés, décisions et actions à retenir."
          },
          {
            role: "user",
            content: `Voici la transcription brute d'une réunion :\n\n${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'Mistral API returned no summary.' });
    }

    const summary = data.choices[0].message.content;
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Mistral API error:', error);
    res.status(500).json({ error: 'Mistral API failed', details: error.message });
  }
};
