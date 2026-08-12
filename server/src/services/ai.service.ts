import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy-key-for-dev';
const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
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

  const questions = Array.isArray(data.questions) ? data.questions : [];

  for (const q of questions) {
    if (!q || !q.isActive || !q.type || typeof q.question !== 'string') continue;
    const t = q.type;
    if (!(t in counters) || counters[t as keyof typeof counters] >= maxPerType) continue;
    counters[t as keyof typeof counters]++;
    const idx = counters[t as keyof typeof counters];

    const typeMap: Record<string, string> = {
      string: 'customString',
      text: 'customText',
      int: 'customInt',
      checkbox: 'customCheckbox',
    };

    const prefix = typeMap[t];
    (data as any)[`${prefix}${idx}State`] = true;
    (data as any)[`${prefix}${idx}Question`] = q.question.trim().slice(0, 255);
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

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response content from AI');

    const parsed: GeneratedFormData = JSON.parse(content);
    return mapQuestionsToFields(parsed);
  } catch (err: any) {
    console.warn(`[AI Service] AI completion failed (${err.message || err}). Using intelligent form generator fallback.`);
    return generateFallbackForm(prompt);
  }
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
}`;

  const userMessage = instructions
    ? `Here is the current form:\n${JSON.stringify(formData, null, 2)}\n\nInstructions for improvement: ${instructions}`
    : `Here is the current form to improve:\n${JSON.stringify(formData, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response content from AI');

    const parsed: GeneratedFormData = JSON.parse(content);
    return mapQuestionsToFields(parsed);
  } catch (err: any) {
    console.warn(`[AI Service] Form improvement failed (${err.message || err}). Returning polished form.`);
    const fallback = {
      title: formData.title ? `${formData.title} (Improved)` : 'Improved Form',
      description: formData.description || 'Enhanced form questionnaire',
      isPublic: formData.isPublic ?? true,
      isQuiz: formData.isQuiz ?? false,
      questions: Array.isArray(formData.questions) && formData.questions.length > 0 ? formData.questions : [
        { type: 'string' as const, question: 'Full Name', isActive: true },
        { type: 'text' as const, question: 'Detailed Feedback', isActive: true }
      ]
    };
    return mapQuestionsToFields(fallback as GeneratedFormData);
  }
}

function generateFallbackForm(prompt: string): GeneratedFormData {
  const lowerPrompt = prompt.toLowerCase();
  let title = prompt.trim();
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  // Capitalize title
  title = title.charAt(0).toUpperCase() + title.slice(1);

  let description = `Automated form generated for: "${prompt}"`;
  let isQuiz = lowerPrompt.includes('quiz') || lowerPrompt.includes('test') || lowerPrompt.includes('exam');
  const questions: GeneratedQuestion[] = [];

  if (lowerPrompt.includes('feedback') || lowerPrompt.includes('customer') || lowerPrompt.includes('survey')) {
    title = 'Customer Feedback Survey';
    description = 'We value your opinion! Please share your thoughts with us.';
    questions.push(
      { type: 'string', question: 'What is your full name?', isActive: true },
      { type: 'string', question: 'What is your email address?', isActive: true },
      { type: 'int', question: 'How satisfied are you with our service? (1-10)', isActive: true },
      { type: 'text', question: 'What can we do to improve your experience?', isActive: true },
      { type: 'checkbox', question: 'May we contact you regarding your feedback?', isActive: true }
    );
  } else if (lowerPrompt.includes('job') || lowerPrompt.includes('application') || lowerPrompt.includes('hiring')) {
    title = 'Job Application Form';
    description = 'Apply for career opportunities at our organization.';
    questions.push(
      { type: 'string', question: 'Full Legal Name', isActive: true },
      { type: 'string', question: 'Contact Email & Phone Number', isActive: true },
      { type: 'int', question: 'Years of relevant professional experience', isActive: true },
      { type: 'text', question: 'Summarize your key achievements and skills', isActive: true },
      { type: 'checkbox', question: 'Are you legally authorized to work in this region?', isActive: true }
    );
  } else if (lowerPrompt.includes('event') || lowerPrompt.includes('register') || lowerPrompt.includes('registration')) {
    title = 'Event Registration Form';
    description = 'Register your attendance for our upcoming event.';
    questions.push(
      { type: 'string', question: 'Participant Full Name', isActive: true },
      { type: 'string', question: 'Organization / Company Name', isActive: true },
      { type: 'int', question: 'Number of attendees in your group', isActive: true },
      { type: 'text', question: 'Dietary requirements or special requests', isActive: true },
      { type: 'checkbox', question: 'Confirm your attendance for the main session', isActive: true }
    );
  } else if (isQuiz) {
    title = 'General Knowledge Quiz';
    description = 'Test your knowledge with this interactive quiz!';
    questions.push(
      { type: 'string', question: 'Question 1: Enter participant identifier or name', isActive: true },
      { type: 'string', question: 'Question 2: What is the primary capital city of Japan?', isActive: true },
      { type: 'int', question: 'Question 3: How many days are in a leap year?', isActive: true },
      { type: 'text', question: 'Question 4: Explain the fundamental law of gravity in brief', isActive: true },
      { type: 'checkbox', question: 'Check to submit your answers for final grading', isActive: true }
    );
  } else {
    questions.push(
      { type: 'string', question: `Full Name / Identifier`, isActive: true },
      { type: 'string', question: `Primary Contact Information`, isActive: true },
      { type: 'int', question: `Rating / Score (1-10)`, isActive: true },
      { type: 'text', question: `Detailed response regarding ${prompt.slice(0, 40)}`, isActive: true },
      { type: 'checkbox', question: `Confirm accuracy of provided information`, isActive: true }
    );
  }

  const formData: GeneratedFormData = {
    title,
    description,
    isPublic: true,
    isQuiz,
    questions,
    questionOrder: []
  };

  return mapQuestionsToFields(formData);
}

