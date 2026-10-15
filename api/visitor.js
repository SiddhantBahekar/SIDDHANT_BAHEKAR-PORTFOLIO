// Vercel Serverless Function: Visitor Telemetry & LinkedIn-Style Owner Analytics
// Endpoint: /api/visitor

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join('/tmp', 'siddhant_visitor_logs.json');
const OWNER_PINS = ['24070521077', 'siddhant', 'siddhant2026', 'admin'];

// In-memory cache for warm serverless execution
let memoryLogs = [];

function loadLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryLogs = parsed;
      }
    }
  } catch (e) {
    // Fallback to memory
  }
}

function saveLogs() {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(memoryLogs.slice(0, 150), null, 2), 'utf8');
  } catch (e) {
    // Non-fatal if /tmp write fails
  }
}

// Initial load
loadLogs();

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-owner-pin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 1. GET: Secure Owner Retrieval for "Who Viewed Your Profile" ---
  if (req.method === 'GET') {
    loadLogs();
    const authPin = (req.query.auth || req.headers['x-owner-pin'] || '').trim();

    if (!authPin || !OWNER_PINS.includes(authPin)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Protected Owner PIN required to view profile visitor telemetry.'
      });
    }

    return res.status(200).json({
      success: true,
      owner: 'Siddhant Shamkumar Bahekar',
      totalRecorded: memoryLogs.length,
      visitors: memoryLogs
    });
  }

  // --- 2. POST: Telemetry Ingestion upon any visitor page open ---
  if (req.method === 'POST') {
    try {
      const body = req.body || {};

      // Extract true visitor IP from Vercel edge proxy
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || body.Visitor_IP_Address || body["📍 Visitor_IP"] || 'Unknown IP');

      // Extract native Vercel Edge Geolocation headers
      const vercelCity = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : (body.City || 'Unknown City');
      const vercelRegion = req.headers['x-vercel-ip-country-region'] || body.Region || '';
      const vercelCountry = req.headers['x-vercel-ip-country'] || body.Country || 'Unknown Country';
      const vercelTimezone = req.headers['x-vercel-ip-timezone'] || 'Asia/Kolkata';

      const locationString = `${vercelCity}, ${vercelRegion ? vercelRegion + ', ' : ''}${vercelCountry}`;

      // Accurate Indian Standard Time (IST)
      const now = new Date();
      const visitTimeIST = now.toLocaleString('en-IN', {
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

      const visitorLocalTime = now.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ` (${vercelTimezone})`;

      const visitCount = body["🔄 Visit_Number"] || body.visitCount || '#1';
      const osName = body.Operating_System || body.os || 'Desktop';
      const browserName = body.Browser || body.browser || 'Web Browser';
      const screenRes = body.Screen_Resolution || body.screen || 'Desktop Screen';
      const currentUrl = body.Page_URL || body.page || req.headers.referer || 'https://vercel.app';
      const referrer = body.Traffic_Referrer || body.referrer || 'Direct Visit';
      const ispCarrier = body["🏢 ISP_Carrier"] || body.isp || 'Global Edge Network';

      // Build structured visitor record for Owner LinkedIn Dashboard
      const visitorRecord = {
        id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        ip: clientIp,
        city: vercelCity,
        region: vercelRegion,
        country: vercelCountry,
        location: locationString,
        isp: ispCarrier,
        os: osName,
        browser: browserName,
        screen: screenRes,
        page: currentUrl,
        referrer: referrer,
        visitCount: visitCount,
        timestampIST: visitTimeIST,
        timeShort: istTimeShort,
        timestamp: Date.now()
      };

      // Store in memory & /tmp cache (keep latest 150)
      loadLogs();
      // Avoid immediate duplicate logs from rapid refresh (within 5 seconds from same IP)
      const recentDup = memoryLogs.find(v => v.ip === clientIp && (Date.now() - v.timestamp < 5000));
      if (!recentDup) {
        memoryLogs.unshift(visitorRecord);
        if (memoryLogs.length > 150) memoryLogs.pop();
        saveLogs();
      }

      // Prepare FormSubmit Email Payload to bahekarsiddhant@gmail.com
      const telemetryPayload = {
        "🔄 Visit_Number": visitCount,
        "⏰ Visit_Time_IST": visitTimeIST,
        "📍 Visitor_IP": clientIp,
        "🌍 Geolocation": locationString,
        "🏢 Hosting_Network": "Vercel Global Edge CDN",
        "🕒 Notice_On_Time": "Server footer below shows UTC time (-5:30 hrs behind India). Actual visit time was " + visitTimeIST,
        _subject: `[${istTimeShort} IST] 👁️ Visitor Alert (${visitCount}): Portfolio Opened from ${vercelCity}, ${vercelCountry} [${clientIp}]`,
        Visitor_IP_Address: clientIp,
        Location: locationString,
        Operating_System: osName,
        Browser: browserName,
        Screen_Resolution: screenRes,
        Page_URL: currentUrl,
        Traffic_Referrer: referrer,
        message: `=============================================================\nNEW PORTFOLIO VISITOR ALERT (${visitCount})\n=============================================================\n\nA user has opened your digital portfolio website hosted on Vercel!\n\n🔄 VISIT INSTANCE        : ${visitCount} from this visitor\n📍 VISITOR IP ADDRESS    : ${clientIp}\n🌍 GEOGRAPHIC LOCATION   : ${locationString}\n🏢 HOSTING INFRASTRUCTURE: Vercel Global Edge Network\n⏰ VISIT TIME (IST)      : ${visitTimeIST}\n🕒 VISITOR LOCAL TIME    : ${visitorLocalTime}\n💻 OS & BROWSER          : ${osName} • ${browserName}\n🖥️ SCREEN RESOLUTION     : ${screenRes}\n🔗 PAGE OPENED           : ${currentUrl}\n🌐 TRAFFIC SOURCE        : ${referrer}\n\n* Note: Any footer below stating UTC time is FormSubmit's server clock.\nThe true visit time was: ${visitTimeIST}\n=============================================================`,
        _template: "table",
        _captcha: "false"
      };

      // Send to FormSubmit in background
      try {
        await fetch('https://formsubmit.co/ajax/170f8c5404eee5a252cf9c82d17295ac', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(telemetryPayload)
        });
      } catch (fErr) {
        // Continue even if FormSubmit email throttles
      }

      return res.status(200).json({
        success: true,
        visitor: visitorRecord,
        totalRecorded: memoryLogs.length
      });
    } catch (err) {
      console.error('Vercel visitor telemetry error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
