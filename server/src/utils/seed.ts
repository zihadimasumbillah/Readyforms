import { sequelize, User, Template, Topic, FormResponse, Comment, Like, Tag, TemplateTag } from '../models';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const USERS_COUNT = 12;
const TOPICS_COUNT = 8;
const TAGS_COUNT = 12;

const LANGUAGES = ['en', 'bn'];
const THEMES = ['light', 'dark', 'system'];

const seedDatabase = async () => {
  try {
    console.log('=========================================');
    console.log('Starting database seeding process...');
    console.log('=========================================');
    
    console.log('Dropping all tables and recreating schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset successful.');

    // ─── 1. Create Topics ──────────────────────────────────────────────────
    console.log('\nCreating topics...');
    const topicDefs = [
      { name: 'Education', description: 'Academic surveys, quizzes, and course feedback' },
      { name: 'Business', description: 'Employee onboarding, HR surveys, and corporate evaluations' },
      { name: 'Entertainment', description: 'Gaming, sports, clubs, and hobby forms' },
      { name: 'Quizzes', description: 'Knowledge tests, trivia, and competitive scoring assessments' },
      { name: 'Research', description: 'Scientific studies, data collection, and bug tracking' },
      { name: 'Healthcare', description: 'Medical intake, patient wellness, and clinical surveys' },
      { name: 'Event Planning', description: 'Conferences, RSVPs, workshops, and seminar registrations' },
      { name: 'Customer Feedback', description: 'Product reviews, CSAT, NPS, and service satisfaction' },
    ];
    
    const topics: Topic[] = [];
    for (const tDef of topicDefs) {
      const topic = await Topic.create({
        name: tDef.name,
        description: tDef.description,
      } as any);
      topics.push(topic);
    }
    console.log(`✅ Created ${topics.length} topics`);

    // Helper map for finding topic ID by name
    const getTopicId = (name: string) => {
      const found = topics.find(t => t.name.toLowerCase() === name.toLowerCase());
      return found ? found.id : topics[0].id;
    };

    // ─── 2. Create Tags ────────────────────────────────────────────────────
    console.log('\nCreating tags...');
    const tagNames = [
      'Popular', 'Education', 'Feedback', 'Survey', 'Knowledge',
      'Programming', 'Science', 'History', 'Customer', 'Evaluation',
      'Health', 'Events'
    ];
    
    const tags: Tag[] = [];
    for (const name of tagNames) {
      const [tag] = await Tag.findOrCreate({
        where: { name },
        defaults: { name }
      });
      tags.push(tag);
    }
    console.log(`✅ Created ${tags.length} tags`);

    // ─── 3. Create Users ───────────────────────────────────────────────────
    console.log('\nCreating users...');
    const users: User[] = [];
    
    // Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true,
      blocked: false,
      language: 'en',
      theme: 'dark',
      lastLoginAt: new Date()
    });
    users.push(admin);
    
    // Regular English User
    const englishUserPassword = await bcrypt.hash('user123', 10);
    const englishUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: englishUserPassword,
      isAdmin: false,
      blocked: false,
      language: 'en',
      theme: 'light',
      lastLoginAt: new Date()
    });
    users.push(englishUser);
    
    // Regular Bangla User
    const banglaUserPassword = await bcrypt.hash('user123', 10);
    const banglaUser = await User.create({
      name: 'বাংলা ব্যবহারকারী',
      email: 'bangla@example.com',
      password: banglaUserPassword,
      isAdmin: false,
      blocked: false,
      language: 'bn',
      theme: 'system',
      lastLoginAt: new Date()
    });
    users.push(banglaUser);
    
    // Additional realistic users
    const sampleUserProfiles = [
      { name: 'Sarah Jenkins', email: 'sarah.j@acme.com', language: 'en', theme: 'light' },
      { name: 'Marcus Chen', email: 'marcus.chen@techcorp.io', language: 'en', theme: 'dark' },
      { name: 'আরিফ হোসেন', email: 'arif.hossein@gmail.com', language: 'bn', theme: 'light' },
      { name: 'Elena Rostova', email: 'elena.rostova@designlab.org', language: 'en', theme: 'system' },
      { name: 'নাসরিন সুলতানা', email: 'nasrin.sultana@edu.bd', language: 'bn', theme: 'light' },
      { name: 'David Miller', email: 'david.m@devstudio.com', language: 'en', theme: 'dark' },
      { name: 'Ayesha Rahman', email: 'ayesha.r@healthplus.org', language: 'en', theme: 'light' },
      { name: 'Liam O\'Connor', email: 'liam.oc@startup.co', language: 'en', theme: 'dark' },
      { name: 'তানভীর আহমেদ', email: 'tanvir.a@techbd.net', language: 'bn', theme: 'system' },
    ];

    for (const prof of sampleUserProfiles) {
      const password = await bcrypt.hash('user123', 10);
      const user = await User.create({
        name: prof.name,
        email: prof.email,
        password,
        isAdmin: false,
        blocked: false,
        language: prof.language,
        theme: prof.theme,
        lastLoginAt: faker.date.recent({ days: 15 })
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // ─── 4. Create Diverse Mock Templates ──────────────────────────────────
    console.log('\nCreating templates...');
    const templates: Template[] = [];

    // Template 1: General Knowledge Quiz (Quiz - EN)
    const t1 = await Template.create({
      title: 'General Knowledge Trivia Quiz',
      description: 'Test your world trivia and general facts with instant scoring.',
      isPublic: true,
      topicId: getTopicId('Quizzes'),
      userId: admin.id,
      isQuiz: true,
      showScoreImmediately: true,
      scoringCriteria: JSON.stringify({
        customString1Answer: { answer: 'Paris', points: 10 },
        customString2Answer: { answer: 'William Shakespeare', points: 10 },
        customInt1Answer: { answer: 8, points: 15 },
        customCheckbox1Answer: { answer: true, points: 5 }
      }),
      customString1State: true,
      customString1Question: 'What is the capital city of France?',
      customString2State: true,
      customString2Question: 'Who wrote the play "Romeo and Juliet"?',
      customInt1State: true,
      customInt1Question: 'How many planets are in our Solar System?',
      customCheckbox1State: true,
      customCheckbox1Question: 'Is water (H2O) classified as a chemical compound?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t1);

    // Template 2: বাংলাদেশ ঐতিহ্য ও সংস্কৃতি কুইজ (Quiz - BN)
    const t2 = await Template.create({
      title: 'বাংলাদেশ ঐতিহ্য ও ইতিহাস কুইজ',
      description: 'বাংলাদেশের স্বাধীনতা সংগ্রাম, ভূগোল ও সংস্কৃতি বিষয়ক একটি বিশেষ কুইজ।',
      isPublic: true,
      topicId: getTopicId('Quizzes'),
      userId: banglaUser.id,
      isQuiz: true,
      showScoreImmediately: true,
      scoringCriteria: JSON.stringify({
        customString1Answer: { answer: 'ঢাকা', points: 10 },
        customString2Answer: { answer: 'রবীন্দ্রনাথ ঠাকুর', points: 10 },
        customInt1Answer: { answer: 1971, points: 15 },
        customCheckbox1Answer: { answer: true, points: 5 }
      }),
      customString1State: true,
      customString1Question: 'বাংলাদেশের বর্তমান রাজধানী কোথায় অবস্থিত?',
      customString2State: true,
      customString2Question: 'বাংলাদেশের জাতীয় সঙ্গীত "আমার সোনার বাংলা" কে রচনা করেন?',
      customInt1State: true,
      customInt1Question: 'বাংলাদেশ কত সালে মহান মুক্তিযুদ্ধের মাধ্যমে স্বাধীন হয়?',
      customCheckbox1State: true,
      customCheckbox1Question: 'বাংলাদেশের জাতীয় ফল কি কাঁঠাল?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t2);

    // Template 3: Software Developer Tech Stack Survey (Survey - EN)
    const t3 = await Template.create({
      title: 'Developer Ecosystem & Tech Stack Survey 2026',
      description: 'Gathering insights from software engineers on programming languages, frameworks, and workflow tools.',
      isPublic: true,
      topicId: getTopicId('Education'),
      userId: englishUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Primary Programming Language (e.g., TypeScript, Python, Go)',
      customString2State: true,
      customString2Question: 'Favorite Frontend Framework (e.g., React, Next.js, Vue)',
      customText1State: true,
      customText1Question: 'What engineering tool or AI copilot has improved your productivity the most?',
      customInt1State: true,
      customInt1Question: 'Years of professional software development experience',
      customCheckbox1State: true,
      customCheckbox1Question: 'Do you contribute to open-source software projects?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customText1', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t3);

    // Template 4: Product Customer Experience (CSAT) Survey (Survey - EN)
    const t4 = await Template.create({
      title: 'Customer Satisfaction (CSAT) & Product Review',
      description: 'Help us improve ReadyForms by sharing your product feedback and user experience.',
      isPublic: true,
      topicId: getTopicId('Customer Feedback'),
      userId: admin.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Which plan level do you currently use? (Free, Pro, Enterprise)',
      customText1State: true,
      customText1Question: 'What features or workflows do you like most about our product?',
      customText2State: true,
      customText2Question: 'What areas, features, or performance aspects need improvement?',
      customInt1State: true,
      customInt1Question: 'On a scale of 1 to 10, how likely are you to recommend ReadyForms to a colleague?',
      customCheckbox1State: true,
      customCheckbox1Question: 'May our product team follow up with you regarding your feedback?',
      questionOrder: JSON.stringify(['customString1', 'customText1', 'customText2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t4);

    // Template 5: গ্রাহক সেবা ও ব্যবহারকারী মতামত (Feedback - BN)
    const t5 = await Template.create({
      title: 'গ্রাহক সেবা ও সন্তুষ্টি জরিপ',
      description: 'আমাদের সেবা ও প্ল্যাটফর্মের সুবিধা বৃদ্ধি করতে আপনার অমূল্য মতামত শেয়ার করুন।',
      isPublic: true,
      topicId: getTopicId('Customer Feedback'),
      userId: banglaUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'আপনার প্রতিষ্ঠান বা কোম্পানির নাম',
      customText1State: true,
      customText1Question: 'আমাদের সেবার কোন বিষয়টি আপনার কাছে সবচেয়ে ভালো লেগেছে?',
      customText2State: true,
      customText2Question: 'কোন দিকে উন্নতি বা পরিবর্তন আনা উচিত বলে মনে করেন?',
      customInt1State: true,
      customInt1Question: '১-১০ স্কেলে আমাদের গ্রাহক সেবার মান কেমন রেট করবেন?',
      customCheckbox1State: true,
      customCheckbox1Question: 'আপনি কি অন্যদের কাছে আমাদের সার্ভিস নেওয়ার সুপারিশ করবেন?',
      questionOrder: JSON.stringify(['customString1', 'customText1', 'customText2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t5);

    // Template 6: Employee Onboarding & Workplace Satisfaction (Survey - EN)
    const t6 = await Template.create({
      title: 'Employee Onboarding & Workplace Culture Survey',
      description: 'Internal HR survey for new hires to assess orientation, team integration, and workplace resources.',
      isPublic: true,
      topicId: getTopicId('Business'),
      userId: admin.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Your Department / Team (e.g., Engineering, Marketing, Operations)',
      customText1State: true,
      customText1Question: 'How clear was the job expectation and orientation process during your first month?',
      customInt1State: true,
      customInt1Question: 'Overall Onboarding Experience Score (1 = Poor, 10 = Exceptional)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Did you receive all necessary hardware, access keys, and software licenses on Day 1?',
      questionOrder: JSON.stringify(['customString1', 'customText1', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t6);

    // Template 7: University Course & Educator Evaluation (Survey - EN)
    const t7 = await Template.create({
      title: 'University Course & Educator Evaluation Form',
      description: 'End-of-semester evaluation for students to review course content, teaching effectiveness, and assignments.',
      isPublic: true,
      topicId: getTopicId('Education'),
      userId: englishUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Course Code & Name (e.g., CS-101 Introduction to Algorithms)',
      customText1State: true,
      customText1Question: 'Which lecture topics or lab assignments were most beneficial for your learning?',
      customText2State: true,
      customText2Question: 'Any suggestions for improving the syllabus, reading material, or lecture pacing?',
      customInt1State: true,
      customInt1Question: 'Rate the instructor\'s clarity and responsiveness (1 to 10)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Would you recommend this course to future students?',
      questionOrder: JSON.stringify(['customString1', 'customText1', 'customText2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t7);

    // Template 8: Tech Conference & Workshop Registration (Form - EN)
    const t8 = await Template.create({
      title: 'Global Tech Summit 2026 — Workshop RSVP',
      description: 'Register your attendance for keynotes, breakout sessions, and hands-on coding workshops.',
      isPublic: true,
      topicId: getTopicId('Event Planning'),
      userId: admin.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Full Legal Name',
      customString2State: true,
      customString2Question: 'Work Email Address',
      customString3State: true,
      customString3Question: 'Company or University Affiliation',
      customText1State: true,
      customText1Question: 'Dietary restrictions or accessibility accommodations needed',
      customInt1State: true,
      customInt1Question: 'Number of conference days attending (1, 2, or 3 days)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Require a Verified Certificate of Attendance?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customString3', 'customText1', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t8);

    // Template 9: আন্তর্জাতিক প্রযুক্তি কনফারেন্স নিবন্ধন (Registration - BN)
    const t9 = await Template.create({
      title: 'আন্তর্জাতিক প্রযুক্তি সামিট ২০২৬ নিবন্ধন',
      description: 'আইটি ওয়ার্কশপ, সেমিনার এবং নেটওয়ার্কিং ইভেন্টে অংশগ্রহণের নিবন্ধন ফর্ম।',
      isPublic: true,
      topicId: getTopicId('Event Planning'),
      userId: banglaUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'অংশগ্রহণকারীর পুরো নাম',
      customString2State: true,
      customString2Question: 'যোগাযোগের ইমেইল ঠিকানা',
      customString3State: true,
      customString3Question: 'প্রতিষ্ঠান বা বিশ্ববিদ্যালয়ের নাম',
      customText1State: true,
      customText1Question: 'কোন বিশেষ সুবিধা বা তথ্য জানাতে চাইলে উল্লেখ করুন',
      customInt1State: true,
      customInt1Question: 'আপনার দলের মোট সদস্য সংখ্যা',
      customCheckbox1State: true,
      customCheckbox1Question: 'সরাসরি ভেন্যুতে উপস্থিত থাকবেন?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customString3', 'customText1', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t9);

    // Template 10: Technical Bug Report & Issue Tracker (Form - EN)
    const t10 = await Template.create({
      title: 'Software Bug Report & Issue Tracker',
      description: 'Submit technical bug reports, API glitches, and UI defects directly to the core engineering team.',
      isPublic: true,
      topicId: getTopicId('Research'),
      userId: englishUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Brief Summary / Title of the Bug',
      customString2State: true,
      customString2Question: 'Environment (e.g., Chrome 120 / macOS Sonoma / Production)',
      customText1State: true,
      customText1Question: 'Detailed steps to reproduce the issue',
      customText2State: true,
      customText2Question: 'Expected behavior vs Actual behavior',
      customInt1State: true,
      customInt1Question: 'Severity Rating (1 = Minor UI tweak, 5 = Blocker/Crash)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Can you reproduce this bug consistently (100% of the time)?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customText1', 'customText2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t10);

    // Template 11: Patient Healthcare & Medical Intake Form (Form - EN)
    const t11 = await Template.create({
      title: 'Patient Medical Intake & Health Screening',
      description: 'Confidential patient registration for medical appointments, symptoms check, and clinical history.',
      isPublic: true,
      topicId: getTopicId('Healthcare'),
      userId: admin.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Patient Full Name',
      customString2State: true,
      customString2Question: 'Emergency Contact Phone Number',
      customText1State: true,
      customText1Question: 'Describe primary symptoms or reason for visit',
      customText2State: true,
      customText2Question: 'List any current medications or drug allergies',
      customInt1State: true,
      customInt1Question: 'Patient Age',
      customCheckbox1State: true,
      customCheckbox1Question: 'Do you have pre-existing medical conditions (e.g., Diabetes, Hypertension)?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customText1', 'customText2', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t11);

    // Template 12: Community Club & Volunteer Application (Form - EN)
    const t12 = await Template.create({
      title: 'Community Organization & Volunteer Application',
      description: 'Join our community service initiatives, youth mentoring programs, and environmental drives.',
      isPublic: true,
      topicId: getTopicId('Entertainment'),
      userId: englishUser.id,
      isQuiz: false,
      customString1State: true,
      customString1Question: 'Applicant Full Name',
      customString2State: true,
      customString2Question: 'Preferred Role / Committee (e.g., Logistics, Outreach, Social Media)',
      customText1State: true,
      customText1Question: 'Why are you interested in volunteering with our community group?',
      customInt1State: true,
      customInt1Question: 'Available hours per week for community service',
      customCheckbox1State: true,
      customCheckbox1Question: 'Do you agree to uphold our Community Code of Conduct?',
      questionOrder: JSON.stringify(['customString1', 'customString2', 'customText1', 'customInt1', 'customCheckbox1'])
    });
    templates.push(t12);

    // Add Tags to all templates cleanly
    console.log('\nAttaching tags to templates...');
    for (const tmpl of templates) {
      const numTags = Math.floor(Math.random() * 2) + 2; // 2 to 3 tags
      const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
        await TemplateTag.create({
          templateId: tmpl.id,
          tagId: shuffledTags[j].id
        });
      }
    }
    console.log(`✅ Created ${templates.length} templates with tags`);

    // ─── 5. Create Form Responses for Each Template ────────────────────────
    console.log('\nCreating realistic form responses...');
    const responses: FormResponse[] = [];
    
    for (const tmpl of templates) {
      // Create 3 responses per template from different users
      for (let rIdx = 0; rIdx < 3; rIdx++) {
        const user = users[(templates.indexOf(tmpl) + rIdx + 1) % users.length];
        
        let customString1Answer: string | undefined;
        let customString2Answer: string | undefined;
        let customString3Answer: string | undefined;
        let customText1Answer: string | undefined;
        let customText2Answer: string | undefined;
        let customInt1Answer: number | undefined;
        let customCheckbox1Answer: boolean | undefined;
        let score: number | undefined;

        if (tmpl.isQuiz) {
          if (tmpl.title.includes('বাংলাদেশ')) {
            const answers = [
              { s1: 'ঢাকা', s2: 'রবীন্দ্রনাথ ঠাকুর', i1: 1971, cb: true, sc: 40 },
              { s1: 'ঢাকা', s2: 'কাজী নজরুল ইসলাম', i1: 1971, cb: true, sc: 30 },
              { s1: 'চট্টগ্রাম', s2: 'রবীন্দ্রনাথ ঠাকুর', i1: 1952, cb: false, sc: 10 },
            ];
            const a = answers[rIdx % answers.length];
            customString1Answer = a.s1;
            customString2Answer = a.s2;
            customInt1Answer = a.i1;
            customCheckbox1Answer = a.cb;
            score = a.sc;
          } else {
            const answers = [
              { s1: 'Paris', s2: 'William Shakespeare', i1: 8, cb: true, sc: 40 },
              { s1: 'Paris', s2: 'Charles Dickens', i1: 8, cb: true, sc: 30 },
              { s1: 'London', s2: 'William Shakespeare', i1: 9, cb: false, sc: 15 },
            ];
            const a = answers[rIdx % answers.length];
            customString1Answer = a.s1;
            customString2Answer = a.s2;
            customInt1Answer = a.i1;
            customCheckbox1Answer = a.cb;
            score = a.sc;
          }
        } else if (tmpl.title.includes('বাংলাদেশ') || tmpl.title.includes('গ্রাহক')) {
          const bResp = [
            { s1: 'অনলাইন শপ বিডি', t1: 'দ্রুত ডেলিভারি এবং চমৎকার সার্ভিস।', t2: 'সার্চ সুবিধা আরও উন্নত করা দরকার।', i1: 9, cb: true },
            { s1: 'টেক সলিউশনস', t1: 'সহজ ইন্টারফেস ও দ্রুত রেসপন্স।', t2: 'মোবাইল অ্যাপ সংস্করণ চালু করলে ভালো হয়।', i1: 10, cb: true },
            { s1: 'ইউনিভার্সিটি আইটি', t1: 'ডিজাইন খুব সুন্দর।', t2: 'বাংলা ফন্ট পরিবর্তন করা প্রয়োজন।', i1: 8, cb: true },
          ];
          const a = bResp[rIdx % bResp.length];
          customString1Answer = a.s1;
          customText1Answer = a.t1;
          customText2Answer = a.t2;
          customInt1Answer = a.i1;
          customCheckbox1Answer = a.cb;
        } else {
          const eResp = [
            { s1: 'TypeScript / React', s2: 'Next.js', t1: 'AI completion speed and custom forms are super helpful.', t2: 'More chart widget options for analytics.', i1: 8, cb: true },
            { s1: 'Python / Django', s2: 'React', t1: 'Clean architecture and smooth UI transitions.', t2: 'Exporting responses to CSV format.', i1: 9, cb: true },
            { s1: 'Go / Node.js', s2: 'Vue.js', t1: 'Role-based access control and admin suite.', t2: 'Dark mode styling enhancement.', i1: 7, cb: false },
          ];
          const a = eResp[rIdx % eResp.length];
          customString1Answer = a.s1;
          customString2Answer = a.s2;
          customText1Answer = a.t1;
          customText2Answer = a.t2;
          customInt1Answer = a.i1;
          customCheckbox1Answer = a.cb;
        }

        const resp = await FormResponse.create({
          templateId: tmpl.id,
          userId: user.id,
          customString1Answer,
          customString2Answer,
          customString3Answer,
          customText1Answer,
          customText2Answer,
          customInt1Answer,
          customCheckbox1Answer,
          score,
          totalPossiblePoints: tmpl.isQuiz ? 40 : undefined,
          scoreViewed: tmpl.isQuiz ? true : undefined,
        });
        responses.push(resp);
      }
    }
    console.log(`✅ Created ${responses.length} form responses`);

    // ─── 6. Create Comments & Likes ────────────────────────────────────────
    console.log('\nCreating comments and likes...');
    const comments: Comment[] = [];
    const likes: Like[] = [];

    const commentTemplates = [
      'This form template is well structured and saved us hours!',
      'Great work on the question flow and options.',
      'এই ফর্মটি ব্যবহার করে খুব সহজে ডেটা সংগ্রহ করতে পেরেছি। ধন্যবাদ!',
      'Extremely useful layout! Added it to my favorites.',
      'খুব সুন্দর ডিজাইন এবং ব্যবহারের সুবিধা চমৎকার।',
      'The scoring feature works flawlessly.'
    ];

    for (const tmpl of templates) {
      // 2 comments per template
      for (let c = 0; c < 2; c++) {
        const u = users[(templates.indexOf(tmpl) + c + 2) % users.length];
        const text = commentTemplates[(templates.indexOf(tmpl) + c) % commentTemplates.length];
        const comment = await Comment.create({
          templateId: tmpl.id,
          userId: u.id,
          content: text
        });
        comments.push(comment);
      }

      // 3 likes per template
      for (let l = 0; l < 3; l++) {
        const u = users[(templates.indexOf(tmpl) + l) % users.length];
        const like = await Like.create({
          templateId: tmpl.id,
          userId: u.id
        });
        likes.push(like);
      }
    }
    console.log(`✅ Created ${comments.length} comments and ${likes.length} likes`);

    console.log('\n=========================================');
    console.log('Database seeding completed successfully! 🎉');
    console.log('=========================================');
    
    console.log('\n📊 Seed Summary:');
    console.log(`- ${users.length} users created (including admin@example.com / admin123)`);
    console.log(`- ${topics.length} topics created`);
    console.log(`- ${tags.length} tags created`);
    console.log(`- ${templates.length} distinct mock templates created`);
    console.log(`- ${responses.length} form responses created`);
    console.log(`- ${comments.length} comments created`);
    console.log(`- ${likes.length} likes created`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

export const ensureDatabaseInitialized = async () => {
  try {
    console.log('[DB] Ensuring database schema and tables exist...');
    await sequelize.sync({ alter: true });
    console.log('[DB] Database schema sync successful.');

    let topicCount = 0;
    try {
      topicCount = await Topic.count();
    } catch (e) {
      topicCount = 0;
    }

    if (topicCount === 0) {
      console.log('[DB] Database is empty. Seeding initial topics & mock data...');
      await seedDatabase();
    }
    return { success: true, message: 'Database schema synced and initial data ready' };
  } catch (err: any) {
    console.error('[DB] Error initializing database:', err.message);
    return { success: false, error: err.message };
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

export default seedDatabase;