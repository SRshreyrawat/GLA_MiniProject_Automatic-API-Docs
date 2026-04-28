const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateDocs(code) {
  try {
    const prompt = `
You are a documentation generator. Analyze the following code and return a JSON object with this structure:
{
  "readme": "A concise, professional markdown README string including Overview and API Endpoints.",
  "endpoints": [
    {
      "method": "GET/POST/PUT/DELETE",
      "path": "/api/route",
      "description": "Brief description of what this endpoint does."
    }
  ]
}

IMPORTANT:
- Focus on the main API entry points.
- Return ONLY the JSON object.
- NO markdown formatting (like blocks) in the outer response.

Code:
${code}
`;

    const result = await genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    }).generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    let text = result.response.text();
    // Remove markdown code block if present
    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    const response = JSON.parse(text);
    return response;

  } catch (err) {
    console.error("Gemini Error:", err);
    return { readme: "Error generating docs", endpoints: [] };
  }
}

module.exports = generateDocs;

