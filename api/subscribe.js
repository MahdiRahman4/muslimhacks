require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

class ZohoCampaigns {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.listKey = process.env.ZOHO_LIST_KEY;
    this.accountsUrl =
      process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zohocloud.ca';
    this.campaignsUrl =
      process.env.ZOHO_CAMPAIGNS_URL || 'https://campaigns.zohocloud.ca';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await axios.post(
      `${this.accountsUrl}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt =
      Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  async addSubscriber(email, firstName = '', lastName = '') {
    const token = await this.getAccessToken();

    const contactInfo = {
      'Contact Email': email,
      'First Name': firstName,
      'Last Name': lastName,
    };

    const response = await axios.post(
      `${this.campaignsUrl}/api/v1.1/json/listsubscribe`,
      null,
      {
        params: {
          resfmt: 'JSON',
          listkey: this.listKey,
          contactinfo: JSON.stringify(contactInfo),
        },
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
      }
    );

    return response.data;
  }
}

const zoho = new ZohoCampaigns();

app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    console.log('📧 Subscribing:', email);

    const result = await zoho.addSubscriber(email);

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('❌ Zoho error:', error.response?.data || error.message);

    return res.status(500).json({
      error: error.response?.data?.message || error.message,
    });
  }
});

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
