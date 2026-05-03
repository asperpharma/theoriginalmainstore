const fetch = require('node-fetch');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mpcxpydkzvwlflxcujnz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

async function testSocialMediaRoute() {
  console.log("🚀 SIMULATING WHATSAPP MESSAGE TO DR. BOT...");

  if (!SUPABASE_ANON_KEY) {
    console.error("❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY env var");
    process.exit(1);
  }

  const payload = {
    data: {
      text: "بدي برنامج لعلاج حب الشباب وتصبغات الوجه"
    }
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/beauty-assistant?route=manychat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("\n✅ DR. BOT RESPONSE (ManyChat Format):");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testSocialMediaRoute();