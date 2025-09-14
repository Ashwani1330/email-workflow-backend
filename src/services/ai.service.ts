import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// A function to decode the base64 email body
function parseEmailBody(parts: any[]): string {
  if (!parts) return '';
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return Buffer.from(part.body.data, 'base64').toString('utf8');
    }
    // Recursive call for multipart emails
    if (part.parts) {
      const result = parseEmailBody(part.parts);
      if (result) return result;
    }
  }
  return '';
}


export const analyzeEmailContent = async (gmailMessage: any) => {
  // Extract the email body and relevant headers
  const headers = gmailMessage.payload.headers;
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
  
  // The body is often nested and base64 encoded
  const body = parseEmailBody(gmailMessage.payload.parts || [gmailMessage.payload]);
  
  const contentToAnalyze = `From: ${from}\nSubject: ${subject}\n\nBody:\n${body}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106', // Use a model that supports JSON mode
      messages: [
        {
          role: 'system',
          content: `You are an expert email assistant. Analyze the following email and return a JSON object with two keys: "priority" and "suggestions". 
          - The "priority" must be one of: "urgent", "neutral", or "spam".
          - The "suggestions" must be an array of exactly 3 professional, short reply drafts as strings.
          - If the email seems to be about scheduling a meeting, one suggestion must explicitly mention scheduling.`,
        },
        {
          role: 'user',
          content: contentToAnalyze,
        },
      ],
      response_format: { type: 'json_object' }, // This ensures the output is valid JSON
    });
    
    const result = response.choices[0].message?.content;
    if (!result) {
        throw new Error("AI did not return a valid response.");
    }

    return JSON.parse(result);

  } catch (error) {
    console.error('Error analyzing email with OpenAI:', error);
    throw new Error('Failed to get AI analysis');
  }
};
