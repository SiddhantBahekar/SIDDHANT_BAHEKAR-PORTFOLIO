// Vercel Serverless Function: Visitor Telemetry Notification
// Endpoint: /api/visitor

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

    // Extract true visitor IP from Vercel's edge proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || body.Visitor_IP_Address || body["📍 Visitor_IP"] || 'Unknown IP');

    // Extract native Vercel Edge Geolocation headers (no third-party lookup required!)
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

    const visitCount = body["🔄 Visit_Number"] || '#1';
    const osName = body.Operating_System || 'Web Device';
    const browserName = body.Browser || 'Browser';
    const screenRes = body.Screen_Resolution || 'Desktop';
    const currentUrl = body.Page_URL || req.headers.referer || 'https://vercel.app';
    const referrer = body.Traffic_Referrer || 'Direct Visit';

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

    // Forward telemetry server-to-server (bypasses browser ad-blockers)
    const response = await fetch('https://formsubmit.co/ajax/170f8c5404eee5a252cf9c82d17295ac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(telemetryPayload)
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Vercel visitor telemetry error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
