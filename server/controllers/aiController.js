import Groq from "groq-sdk";

export const generateInitialReport = async (req, res) => {
  try {
    const { data, headers } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "CSV data is required" });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const sampleData = data.slice(0, 20);

    const prompt = `
You are an AI data analyst.

Analyze this CSV dataset and return ONLY valid JSON.

Headers:
${JSON.stringify(headers)}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Return JSON in this exact format:
{
  "summary": "short summary of dataset",
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "kpis": {
    "primaryMetricLabel": "label",
    "primaryMetricValue": "value",
    "secondaryMetricLabel": "label",
    "secondaryMetricValue": "value",
    "topCategoryLabel": "label",
    "topCategoryValue": "value"
  },
  "chart": {
    "type": "bar",
    "xField": "best categorical column name",
    "yField": "best numeric column name",
    "title": "short chart title"
  }
}

Rules:
- Return JSON only
- No markdown
- No explanation
- Choose chart type from: bar, line, pie
- Use actual header names from the dataset
- Keep values short and readable
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You must always return strict valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    const cleanedText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.log("Raw AI response:", rawText);
      return res.status(500).json({
        message: "AI returned invalid JSON",
        raw: rawText,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.log("Initial report error:", error);
    return res.status(500).json({
      message: "AI failed",
      error: error.message,
    });
  }
};

export const askFollowupQuestion = async (req, res) => {
  try {
    const { question, data, headers } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const sampleData = (data || []).slice(0, 20);

    const prompt = `
You are an AI data analyst.

Dataset headers:
${JSON.stringify(headers)}

Sample rows:
${JSON.stringify(sampleData, null, 2)}

User question:
${question}

Return ONLY valid JSON in this format:
{
  "answer": "short clear answer",
  "insights": [
    "point 1",
    "point 2",
    "point 3"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}

Rules:
- JSON only
- No markdown
- No explanation outside JSON
- Recommendations must be practical business actions
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You must always return strict valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    const cleanedText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.log("Raw follow-up AI response:", rawText);
      return res.status(500).json({
        message: "AI returned invalid JSON",
        raw: rawText,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.log("Follow-up error:", error);
    return res.status(500).json({
      message: "AI follow-up failed",
      error: error.message,
    });
  }
};
