const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
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

// Function to get transcript using ytdl-core
async function getTranscript(videoId) {
  try {
    const info = await ytdl.getInfo(videoId); // Use getInfo to get detailed video information
    const captions = info.player_response.captions; // Access caption information

    if (!captions || !captions.length) {
      throw new Error('No transcript available');
    }

    // Assuming the first caption track is the desired one; you can adjust this as needed
    const transcriptUrl = captions[0].baseUrl; // Get the URL for the transcript

    // Fetch the actual transcript data
    const response = await fetch(transcriptUrl);
    const transcriptData = await response.text(); // Depending on the format, parse the transcript accordingly

    // Here, you should parse the transcript data into a readable format
    // This is a placeholder; implement the parsing logic as necessary
    return {
      title: info.title,
      thumbnailUrl: info.thumbnail_url,
      transcript: transcriptData, // Replace with the actual transcript text
    };
  } catch (err) {
    throw new Error(`Error fetching transcript: ${err.message}`);
  }
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
    return res.status(500).json({ error: error.message || 'Failed to process transcript' });
  }
});

// Other server configurations...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
