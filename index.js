const express = require('express');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const { analyzeTranscript } = require('./analyzeTranscript'); // Ensure this path is correct

const app = express();
app.use(express.json());

// Helper function to extract video ID from the YouTube URL
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

// Placeholder function to get transcript using ytdl-core
async function getTranscript(videoId) {
  return new Promise((resolve, reject) => {
    ytdl.getBasicInfo(videoId, (err, info) => {
      if (err) return reject(err);
      
      const transcriptUrl = info.player_response.captions; // Access caption information
      if (!transcriptUrl || !transcriptUrl.length) {
        return reject(new Error('No transcript available'));
      }

      // Process to get the actual transcript text (if available)
      resolve({
        title: info.title,
        thumbnailUrl: info.thumbnail_url,
        transcript: 'Mocked transcript data for example purposes.', // Replace with actual fetching of the transcript
      });
    });
  });
}

app.post('/api/transcribe', async (req, res) => {
  const { url } = req.body;

  // Validate the URL
  if (!url) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const videoId = extractVideoID(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }

    const transcriptData = await getTranscript(videoId); // Get the transcript

    // Analyze the transcript
    const analyzedTranscript = analyzeTranscript(transcriptData.transcript);

    return res.status(200).json({
      videoTitle: transcriptData.title,
      thumbnailUrl: transcriptData.thumbnailUrl,
      transcript: analyzedTranscript,
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return res.status(500).json({ error: 'Failed to process transcript' });
  }
});

// Other server configurations...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
