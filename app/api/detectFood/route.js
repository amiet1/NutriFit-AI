import OpenAI from "openai";
import { RateLimiterMemory } from 'rate-limiter-flexible';

const client = new OpenAI();

// Create rate limiters
const minuteLimiter = new RateLimiterMemory({
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

const dailyLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 86400, // Per day (24 hours)
});

export async function POST(request) {
  try {
    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    try {
      // Check both rate limits
      await Promise.all([
        minuteLimiter.consume(ip),
        dailyLimiter.consume(ip)
      ]);
    } catch (rateLimitError) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          details: 'Rate limit exceeded. Maximum 10 requests per minute or 100 requests per day.'
        }),
        {
          status: 429, // Too Many Requests
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();

    if (!body.image) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const base64Image = body.image.replace(/^data:image\/(jpeg|png|jpg);base64,/, '');

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
                {
                  type: "text",
                  text: "What food do you see in this image? give me the name of the food and the calories.",
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });
      
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze image');
    }

    const json = await response.json();
    return new Response(
      JSON.stringify(json),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in /api/identify:', error);

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;

    return new Response(
      JSON.stringify({
        error: 'Failed to identify food',
        details: errorMessage,
        status: statusCode,
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}