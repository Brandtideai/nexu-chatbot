export default async function handler(req, res) {
  // ✅ Step 1: CORS HEADERS — MUST BE FIRST
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Step 2: Handle Preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ✅ Step 3: Block anything except POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ Step 4: Validate request body
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // ✅ Step 5: Call OpenAI with your training logic
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are Nexus — the intelligent, confident strategist for BrandTide.ai...` // full prompt here
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Nexus is quiet right now.";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: "OpenAI call failed", details: err.message });
  }
}
