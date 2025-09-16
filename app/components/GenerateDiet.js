// pages/api/generateDiet.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { metrics, goals } = req.body;

    const prompt = `
      User body metrics: 
      Shoulders: ${metrics.shoulders}px
      Chest: ${metrics.chest}px
      Waist: ${metrics.waist}px
      Hips: ${metrics.hips}px
      Waist/Shoulder Ratio: ${metrics.waistToShoulderRatio.toFixed(2)}
      Hip/Waist Ratio: ${metrics.hipToWaistRatio.toFixed(2)}

      User goal: ${goals}

      Generate a detailed 7-day meal plan for weight loss, including breakfast, lunch, dinner, and snacks.
      Include estimated calories per meal.
    `;

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const dietPlan = response.data.choices[0].message.content;
      res.status(200).json({ dietPlan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generating diet plan" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
