const { CallClient, AzureCommunicationTokenCredential } = require('@azure/communication-calling');

// Handler principal pour Vercel
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const meetingLink = req.body.meetingLink;

  if (!meetingLink) {
    res.status(400).json({ error: 'Missing meetingLink in request body.' });
    return;
  }

  try {
    // Ton token ACS (valide pour 24h environ)
    const token = process.env.ACS_ACCESS_TOKEN || "eyJhbGciOiJSUzI1NiIsImtpZCI6IkRCQTFENTcz..."; // remplace ou utilise via Vercel env

    // Création des identifiants d'accès
    const tokenCredential = new AzureCommunicationTokenCredential(token);
    const callClient = new CallClient();

    // Création de l'agent d'appel
    const callAgent = await callClient.createCallAgent(tokenCredential);

    // Lancement de la connexion à la réunion Teams
    const call = callAgent.join({ meetingLink }, { audioOptions: { muted: true } });

    call.on('stateChanged', () => {
      console.log('État de la réunion :', call.state);
    });

    res.status(200).json({
      message: 'Le bot a rejoint la réunion avec succès.',
      meetingLink,
      state: call.state
    });
  } catch (error) {
    console.error('Erreur lors de la tentative de connexion à la réunion :', error);
    res.status(500).json({ error: 'Impossible de rejoindre la réunion.', details: error.message });
  }
};
