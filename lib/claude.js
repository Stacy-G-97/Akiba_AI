import axios from "axios";

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

export async function getAIAdvice(userPrompt) {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        messages: [{ role: "user", content: userPrompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
        },
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error("Claude AI error:", error);
    return "Sorry, I couldn’t process your request.";
  }
}
