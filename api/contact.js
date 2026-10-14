// Vercel Serverless Function: Direct Contact Message Handler
// Endpoint: /api/contact

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const name = body.name || body["👤 Sender_Name"] || 'Website Visitor';
    const email = body.email || body._replyto || body["✉️ Sender_Email"] || '';
    const subject = body.subject || body["📌 Subject"] || 'Portfolio Inquiry';
    const message = body.message || '';

    // Vercel Edge Geolocation and Client IP
    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'Unknown IP';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const country = req.headers['x-vercel-ip-country'] || '';
    const locationString = city ? `${city}, ${region ? region + ', ' : ''}${country}` : '';

    // Accurate Indian Standard Time (IST, UTC+5:30)
    const now = new Date();
    const istTimestamp = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    }) + ' (IST / India Standard Time)';

    const istTimeShort = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const emailSubject = `[${istTimeShort} IST] 📩 Message from ${name} (${email}): ${subject}`;

    const payload = {
      "⏰ Indian_Standard_Time_IST": istTimestamp,
      "👤 Sender_Name": name,
      "✉️ Sender_Email": email,
      "📌 Subject": subject,
      "📍 Visitor_IP": clientIp,
      "🌍 Sender_Location": locationString || 'Vercel Global Edge Network',
      "🕒 Timezone_Notice": "FormSubmit server footer displays UTC (-5:30 hrs behind India). Actual submission time is Indian Standard Time (IST) listed above.",
      _replyto: email,
      _subject: emailSubject,
      message: `=============================================================\nINCOMING PORTFOLIO CONTACT MESSAGE (VERCEL DEPLOYMENT)\n=============================================================\n\n⏰ TIME OF SUBMISSION (IST) : ${istTimestamp}\n\n👤 SENDER'S NAME            : ${name}\n✉️ SENDER'S EMAIL           : ${email}\n📌 INQUIRY SUBJECT          : ${subject}\n📍 SENDER IP ADDRESS        : ${clientIp}\n🌍 SENDER LOCATION          : ${locationString || 'Direct Web Visit'}\n\n-------------------- MESSAGE CONTENT ------------------------\n${message}\n\n-------------------------------------------------------------\n[Reply directly to this email in your inbox to contact ${name} at ${email}]\n\n* Note: Any footer below stating UTC time is FormSubmit's server clock.\nThe true submission time was: ${istTimestamp}\n=============================================================`,
      _template: "table",
      _captcha: "false"
    };

    const response = await fetch('https://formsubmit.co/ajax/170f8c5404eee5a252cf9c82d17295ac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Vercel contact handler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
