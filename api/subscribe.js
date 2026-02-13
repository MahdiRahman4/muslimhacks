const axios = require('axios');

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

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const result = await zoho.addSubscriber(email);

    if (
      result.code === 2041 ||
      (result.code === '0' && result.message?.toLowerCase().includes('already exists')) ||
      result.message?.toLowerCase().includes('already') ||
      result.message?.toLowerCase().includes('duplicate')
    ) {
      return res.status(400).json({
        success: false,
        error: 'You have already been pre-registered.',
      });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    const errorData = error.response?.data;

    if (
      errorData?.code === 2041 ||
      (errorData?.code === '0' && errorData?.message?.toLowerCase().includes('already exists')) ||
      errorData?.message?.toLowerCase().includes('already') ||
      errorData?.message?.toLowerCase().includes('duplicate')
    ) {
      return res.status(400).json({
        success: false,
        error: 'You have already been pre-registered.',
      });
    }

    return res.status(500).json({ error: error.response?.data?.message || error.message });
  }
};
