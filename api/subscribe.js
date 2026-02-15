import axios from "axios";

const accountsUrl =
  process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zohocloud.ca";
const campaignsUrl =
  process.env.ZOHO_CAMPAIGNS_URL || "https://campaigns.zohocloud.ca";

const REQUIRED_ENV_KEYS = [
  "ZOHO_CLIENT_ID",
  "ZOHO_CLIENT_SECRET",
  "ZOHO_REFRESH_TOKEN",
  "ZOHO_LIST_KEY",
  "RECAPTCHA_SECRET_KEY",
];

let accessToken = null;
let tokenExpiresAt = 0;

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const assertEnv = () => {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
};

const normalizeEmail = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  return email.includes("@") ? email : null;
};

const isDuplicateResponse = (payload) => {
  const code = String(payload?.code || "");
  const message = String(payload?.message || "").toLowerCase();

  return (
    code === "2041" ||
    (code === "0" && message.includes("already exists")) ||
    message.includes("already") ||
    message.includes("duplicate")
  );
};

const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
    params: {
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    },
  });

  accessToken = response.data.access_token;
  tokenExpiresAt = Date.now() + ((response.data.expires_in || 3600) - 300) * 1000;

  return accessToken;
};

const addSubscriber = async (email) => {
  const token = await getAccessToken();

  const response = await axios.post(
    `${campaignsUrl}/api/v1.1/json/listsubscribe`,
    null,
    {
      params: {
        resfmt: "JSON",
        listkey: process.env.ZOHO_LIST_KEY,
        contactinfo: JSON.stringify({ "Contact Email": email }),
      },
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    }
  );

  return response.data;
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
};

const verifyRecaptcha = async ({ token, remoteip }) => {
  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip,
      },
      timeout: 10_000,
    }
  );

  return response.data;
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    assertEnv();

    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Valid email is required.",
      });
    }

    const recaptchaToken = typeof req.body?.recaptchaToken === "string" ? req.body.recaptchaToken : "";
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        error: "Captcha verification is required.",
      });
    }

    const captchaResult = await verifyRecaptcha({
      token: recaptchaToken,
      remoteip: getClientIp(req),
    });

    if (!captchaResult?.success) {
      return res.status(400).json({
        success: false,
        error: "Captcha verification failed. Please try again.",
      });
    }

    const result = await addSubscriber(email);

    if (isDuplicateResponse(result)) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      alreadyRegistered: false,
      data: result,
    });
  } catch (error) {
    const errorData = error.response?.data;
    console.error("Zoho subscribe error:", errorData || error.message);

    if (isDuplicateResponse(errorData)) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        data: errorData,
      });
    }

    return res.status(500).json({
      success: false,
      error: errorData?.message || error.message || "Subscription failed.",
    });
  }
}
