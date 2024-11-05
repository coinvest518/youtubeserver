const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { analyzeTranscript } = require('./analyzeTranscript'); // Import your analysis function

const app = express();
app.use(express.json());

const ASSEMBLYAI_API_KEY = 'YOUR_ASSEMBLYAI_API_KEY';

// Helper function to extract video ID
function extractVideoID(url) {
  const patterns = [
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|youtube\.com\/shorts\/)([^#&?/]{11})/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([^#&?/]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Download video and save to disk
async function downloadVideo(videoId) {
  const filePath = path.resolve(__dirname, `${videoId}.mp4`);
  const videoStream = ytdl(videoId, { filter: 'audioandvideo', quality: 'highest' });

  await new Promise((resolve, reject) => {
    videoStream.pipe(fs.createWriteStream(filePath))
      .on('finish', resolve)
      .on('error', reject);
  });

  return filePath;
}

// Upload video to AssemblyAI and get the transcript
async function getTranscriptFromAssemblyAI(filePath) {
  // Upload video file to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY,
    },
    body: fs.createReadStream(filePath),
  });
  const { upload_url } = await uploadResponse.json();

  // Request transcription
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio_url: upload_url }),
  });
  const transcriptData = await transcriptResponse.json();

  // Poll for transcription completion
  let status = transcriptData.status;
  while (status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
      headers: { 'authorization': ASSEMBLYAI_API_KEY },
    });
    const pollingData = await pollingResponse.json();
    status = pollingData.status;
    if (status === 'failed') throw new Error('Transcription failed');
  }

  return pollingData.text; // Transcription text
}

app.post('/api/transcribe', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const videoId = extractVideoID(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }

    const filePath = await downloadVideo(videoId); // Download the video
    const transcriptText = await getTranscriptFromAssemblyAI(filePath); // Get transcription text

    // Clean up the downloaded file
    fs.unlinkSync(filePath);

    // Analyze the transcript
    const analyzedTranscript = analyzeTranscript(transcriptText);

    return res.status(200).json({
      videoTitle: videoId, // Can replace with actual title if necessary
      transcript: analyzedTranscript,
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return res.status(500).json({ error: 'Failed to process transcript' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
