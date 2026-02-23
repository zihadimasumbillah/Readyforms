import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface GeneratedQuestion {
  type: 'string' | 'text' | 'int' | 'checkbox';
  question: string;
  isActive: boolean;
}

interface GeneratedFormData {
  title: string;
  description: string;
  isPublic: boolean;
  isQuiz: boolean;
  questions: GeneratedQuestion[];
  questionOrder: string[];
  customString1State?: boolean;
  customString1Question?: string;
  customString2State?: boolean;
  customString2Question?: string;
  customString3State?: boolean;
  customString3Question?: string;
  customString4State?: boolean;
  customString4Question?: string;
  customText1State?: boolean;
  customText1Question?: string;
  customText2State?: boolean;
  customText2Question?: string;
  customText3State?: boolean;
  customText3Question?: string;
  customText4State?: boolean;
  customText4Question?: string;
  customInt1State?: boolean;
  customInt1Question?: string;
  customInt2State?: boolean;
  customInt2Question?: string;
  customInt3State?: boolean;
  customInt3Question?: string;
  customInt4State?: boolean;
  customInt4Question?: string;
  customCheckbox1State?: boolean;
  customCheckbox1Question?: string;
  customCheckbox2State?: boolean;
  customCheckbox2Question?: string;
  customCheckbox3State?: boolean;
  customCheckbox3Question?: string;
  customCheckbox4State?: boolean;
  customCheckbox4Question?: string;
}

function mapQuestionsToFields(data: GeneratedFormData): GeneratedFormData {
  const counters = { string: 0, text: 0, int: 0, checkbox: 0 };
  const maxPerType = 4;
  const questionOrder: string[] = [];

  for (const q of data.questions) {
    if (!q.isActive) continue;
    const t = q.type;
    if (counters[t] >= maxPerType) continue;
    counters[t]++;
    const idx = counters[t];

    const typeMap: Record<string, string> = {
      string: 'customString',
      text: 'customText',
      int: 'customInt',
      checkbox: 'customCheckbox',
    };

    const prefix = typeMap[t];
    (data as any)[`${prefix}${idx}State`] = true;
    (data as any)[`${prefix}${idx}Question`] = q.question;
    questionOrder.push(`${prefix}${idx}`);
  }

  data.questionOrder = questionOrder;
  return data;
}

export async function generateForm(prompt: string): Promise<GeneratedFormData> {
  const systemPrompt = `You are a form generation AI. Given a user's description, generate a structured form as JSON.
The form can have up to 4 questions of each type: string (short text), text (long text), int (number), checkbox (yes/no).
That's a maximum of 16 questions total.

Return JSON with this structure:
{
  "title": "Form Title",
  "description": "Form description",
  "isPublic": true,
  "isQuiz": false,
  "questions": [
    { "type": "string", "question": "What is your name?", "isActive": true },
    { "type": "text", "question": "Describe your experience", "isActive": true },
    { "type": "int", "question": "How many years of experience?", "isActive": true },
    { "type": "checkbox", "question": "Do you agree to the terms?", "isActive": true }
  ]
}

Types available: "string" (short text input), "text" (long text/textarea), "int" (number input), "checkbox" (yes/no toggle).
Maximum 4 of each type. Generate relevant, well-worded questions based on the user's description.
Set isQuiz to true only if the user explicitly asks for a quiz or test.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed: GeneratedFormData = JSON.parse(content);
  return mapQuestionsToFields(parsed);
}

export async function improveForm(formData: any, instructions?: string): Promise<GeneratedFormData> {
  const systemPrompt = `You are a form improvement AI. Given existing form data and optional instructions, improve the form.
Return the improved form as JSON with the same structure:
{
  "title": "Improved Form Title",
  "description": "Improved description",
  "isPublic": true,
  "isQuiz": false,
  "questions": [
    { "type": "string", "question": "Improved question?", "isActive": true }
  ]
}

Types available: "string" (short text input), "text" (long text/textarea), "int" (number input), "checkbox" (yes/no toggle).
Maximum 4 of each type. Improve question wording, add missing fields, and enhance the overall form quality.`;

  const userMessage = instructions
    ? `Here is the current form:\n${JSON.stringify(formData, null, 2)}\n\nInstructions for improvement: ${instructions}`
    : `Here is the current form to improve:\n${JSON.stringify(formData, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  const parsed: GeneratedFormData = JSON.parse(content);
  return mapQuestionsToFields(parsed);
}
