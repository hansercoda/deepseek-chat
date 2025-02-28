const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Deepseek API configurations
const DEEPSEEK_V3_API_KEY = process.env.DEEPSEEK_V3_API_KEY;
const DEEPSEEK_R1_API_KEY = process.env.DEEPSEEK_R1_API_KEY;
const BING_API_KEY = process.env.BING_API_KEY;

// Helper function for Bing search
async function performBingSearch(query) {
  try {
    const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
      },
      params: {
        q: query,
        count: 5,
      },
    });
    return response.data.webPages.value.map(page => ({
      title: page.name,
      snippet: page.snippet,
      url: page.url,
    }));
  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

// Deepseek API endpoints
app.post('/api/chat/deepseek-v3', async (req, res) => {
  try {
    const response = await axios.post('https://api.deepseek.com/v3/chat', {
      messages: [{ role: 'user', content: req.body.message }],
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_V3_API_KEY}`,
      },
    });
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Deepseek V3 error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/deepseek-r1', async (req, res) => {
  try {
    const response = await axios.post('https://api.deepseek.com/r1/chat', {
      messages: [{ role: 'user', content: req.body.message }],
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_R1_API_KEY}`,
      },
    });
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Deepseek R1 error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/deepseek-v3-bing', async (req, res) => {
  try {
    const searchResults = await performBingSearch(req.body.message);
    const contextWithSearch = `Search results:\n${searchResults.map(result => 
      `${result.title}\n${result.snippet}\n${result.url}`
    ).join('\n\n')}\n\nUser question: ${req.body.message}`;

    const response = await axios.post('https://api.deepseek.com/v3/chat', {
      messages: [{ role: 'user', content: contextWithSearch }],
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_V3_API_KEY}`,
      },
    });
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Deepseek V3 + Bing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/deepseek-r1-bing', async (req, res) => {
  try {
    const searchResults = await performBingSearch(req.body.message);
    const contextWithSearch = `Search results:\n${searchResults.map(result => 
      `${result.title}\n${result.snippet}\n${result.url}`
    ).join('\n\n')}\n\nUser question: ${req.body.message}`;

    const response = await axios.post('https://api.deepseek.com/r1/chat', {
      messages: [{ role: 'user', content: contextWithSearch }],
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_R1_API_KEY}`,
      },
    });
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Deepseek R1 + Bing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 