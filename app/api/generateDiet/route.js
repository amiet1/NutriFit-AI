import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure you have this in your .env
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { metrics } = body;

    if (!metrics) {
      return new Response(JSON.stringify({ error: "Metrics not provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct prompt for AI
    const prompt = `
You are a nutritionist AI. Create a personalized weight-loss diet plan for a person with the following body metrics:
- Shoulders: ${metrics.shoulders}px
- Chest: ${metrics.chest}px
- Waist: ${metrics.waist}px
- Hips: ${metrics.hips}px
- Waist/Shoulder Ratio: ${metrics.waistToShoulderRatio?.toFixed(2)}
- Hip/Waist Ratio: ${metrics.hipToWaistRatio?.toFixed(2)}

Provide a full-day diet plan (breakfast, lunch, dinner, snacks) with estimated calories.
Make it concise, practical, and healthy.
`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful nutritionist AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const dietPlan =
      response.choices[0]?.message?.content || "No diet plan returned";

    return new Response(JSON.stringify({ dietPlan }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
