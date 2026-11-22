
const analyzeLeadWithAI = async (lead) => {
  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      throw new Error(`n8n error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI analysis failed:", error.message);
    return null;
  }
};

export default analyzeLeadWithAI;
