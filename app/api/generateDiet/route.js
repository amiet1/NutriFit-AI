import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req) {
  try {
    console.log("=== DIET GENERATION API CALLED ===");

    const body = await req.json();
    console.log("Received body:", body);
    const { metrics } = body;

    if (!metrics) {
      console.error("No metrics provided in request body");
      return new Response(JSON.stringify({ error: "Metrics not provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Metrics received:", metrics);

    // Construct prompt for AI
    const prompt = `
You are a professional nutritionist AI. Create a personalized diet plan based on these body scan measurements:

Body Measurements:
- Shoulders: ${metrics.shoulders}px
- Chest: ${metrics.chest}px  
- Waist: ${metrics.waist}px
- Hips: ${metrics.hips}px
- Waist/Shoulder Ratio: ${metrics.waistToShoulderRatio?.toFixed(2)}
- Hip/Waist Ratio: ${metrics.hipToWaistRatio?.toFixed(2)}

Based on these measurements, create a comprehensive 7-day meal plan that includes:
1. Daily calorie target (1500-1800 calories for healthy weight loss)
2. Breakfast, lunch, dinner, and 2 snacks per day
3. Specific portion sizes
4. Macronutrient breakdown (protein, carbs, fats)
5. Hydration goals
6. Meal timing recommendations

Make it practical, healthy, and sustainable. Include specific foods with exact measurements.
`;

    // Call OpenAI
    console.log("Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful nutritionist AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("OpenAI response received");
    const dietPlan =
      response.choices[0]?.message?.content || "No diet plan returned";

    console.log("Returning diet plan:", dietPlan.substring(0, 100) + "...");
    return new Response(JSON.stringify({ dietPlan }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("=== DIET GENERATION ERROR ===");
    console.error("Error type:", err.constructor.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);

    return new Response(
      JSON.stringify({
        error: err.message,
        details: err.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
