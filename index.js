const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.post('/youtubeTranscript', async (req, res) => {
    try {
        const { videoId } = req.body;
        
        if (!ytdl.validateID(videoId)) {
            return res.status(400).json({ error: 'Invalid video ID' });
        }

        const info = await ytdl.getInfo(videoId);
        res.json({ info });
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
