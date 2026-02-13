require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 1. CORS - This must stay here
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());


process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

class ZohoCampaigns {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.listKey = process.env.ZOHO_LIST_KEY;
    this.accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zohocloud.ca';
    this.campaignsUrl = process.env.ZOHO_CAMPAIGNS_URL || 'https://campaigns.zohocloud.ca';
  }

  async getAccessToken() {
    const response = await axios.post(`${this.accountsUrl}/oauth/v2/token`, null, {
      params: {
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      },
    });
    return response.data.access_token;
  }

  async addSubscriber(email) {
    const token = await this.getAccessToken();
    const contactInfo = { 'Contact Email': email };
    
    const response = await axios.post(`${this.campaignsUrl}/api/v1.1/json/listsubscribe`, null, {
      params: {
        resfmt: 'JSON',
        listkey: this.listKey,
        contactinfo: JSON.stringify(contactInfo),
      },
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
    return response.data;
  }
}

const zoho = new ZohoCampaigns();

app.post('/api/subscribe', async (req, res) => {
  console.log('📨 Request for:', req.body.email);
  try {
    const result = await zoho.addSubscriber(req.body.email);
    console.log('✅ Zoho Response:', result);    
    
    // Check if email is already in the list
    // Zoho returns code '0' with message about "already exists" for duplicates
    if (
      result.code === 2041 || 
      result.code === '0' && result.message?.toLowerCase().includes('already exists') ||
      result.message?.toLowerCase().includes('already') || 
      result.message?.toLowerCase().includes('duplicate')
    ) {
      return res.status(400).json({
        success: false,
        error: 'You have already been pre-registered.',
      });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    const errorData = error.response?.data;
    
    // Check for duplicate/already subscribed errors
    if (
      errorData?.code === 2041 || 
      errorData?.code === '0' && errorData?.message?.toLowerCase().includes('already exists') ||
      errorData?.message?.toLowerCase().includes('already') || 
      errorData?.message?.toLowerCase().includes('duplicate')
    ) {
      return res.status(400).json({
        success: false,
        error: 'You have already been pre-registered.',
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001; 
app.listen(PORT, () => {
  console.log(` Server actually running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is BUSY.`);
  } else {
    console.error('❌ Server error:', err);
  }
});