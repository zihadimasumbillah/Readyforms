import { sequelize, User, Template, Topic, FormResponse, Comment, Like, Tag, TemplateTag } from '../models';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

// Reduced configuration constants to limit data insertion
const USERS_COUNT = 10;          // Reduced from 20
const TOPICS_COUNT = 8;          // Reduced from 10
const TAGS_COUNT = 10;           // Reduced from 15
const TEMPLATES_COUNT = 15;      // Reduced from 30
const RESPONSES_PER_TEMPLATE = 3; // Fixed number of responses per template
const COMMENTS_PER_TEMPLATE = 2;  // Fixed number of comments per template
const LIKES_PER_TEMPLATE = 3;     // Fixed number of likes per template

// Language options limited to English and Bangla
const LANGUAGES = ['en', 'bn'];
const THEMES = ['light', 'dark', 'system'];

const seedDatabase = async () => {
  try {
    console.log('=========================================');
    console.log('Starting database seeding process...');
    console.log('=========================================');
    
    // Force sync to drop all tables and recreate them
    console.log('Dropping all tables and recreating schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset successful.');

    // Create Topics
    console.log('\nCreating topics...');
    const topics: Topic[] = [];
    const topicNames = [
      'Education', 'Business', 'Entertainment', 'Quizzes', 
      'Research', 'Healthcare', 'Event Planning', 'Customer Feedback'
    ];
    
    for (let i = 0; i < TOPICS_COUNT; i++) {
      const name = i < topicNames.length ? topicNames[i] : faker.word.noun() + ' Forms';
      const topic = await Topic.create({
        name,
        description: faker.lorem.sentence()
      } as any);
      topics.push(topic);
    }
    console.log(`✅ Created ${topics.length} topics`);

    // Create Tags
    console.log('\nCreating tags...');
    const tags: Tag[] = [];
    const tagNames = [
      'Popular', 'Education', 'Feedback', 'Survey', 'Knowledge',
      'Programming', 'Science', 'History', 'Customer', 'Evaluation'
    ];
    
    for (let i = 0; i < TAGS_COUNT; i++) {
      const name = i < tagNames.length ? tagNames[i] : faker.word.adjective();
      const [tag] = await Tag.findOrCreate({
        where: { name },
        defaults: { name }
      });
      tags.push(tag);
    }
    console.log(`✅ Created ${tags.length} tags`);

    // Create Users
    console.log('\nCreating users...');
    const users: User[] = [];
    
    // Create admin user
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
    
    // Create regular user with English
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
    
    // Create Bangla user
    const banglaUserPassword = await bcrypt.hash('user123', 10);
    const banglaUser = await User.create({
      name: 'বাংলা ব্যবহারকারী', // Bangla User
      email: 'bangla@example.com',
      password: banglaUserPassword,
      isAdmin: false,
      blocked: false,
      language: 'bn',
      theme: 'system',
      lastLoginAt: new Date()
    });
    users.push(banglaUser);
    
    // Create additional random users (limit to remaining count)
    for (let i = 0; i < USERS_COUNT - 3; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email().toLowerCase();
      const password = await bcrypt.hash(faker.internet.password(), 10);
      
      const user = await User.create({
        name,
        email,
        password,
        isAdmin: Math.random() < 0.1, // 10% chance to be admin
        blocked: Math.random() < 0.05, // 5% chance to be blocked
        language: faker.helpers.arrayElement(LANGUAGES),
        theme: faker.helpers.arrayElement(THEMES),
        lastLoginAt: faker.date.past()
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create Templates
    console.log('\nCreating templates...');
    const templates: Template[] = [];
    
    // Quiz template function - English
    const createEnglishQuizTemplate = async (userId: string, topicId: string) => {
      const scoringCriteria = {
        'customString1Answer': { answer: 'Paris', points: 5 },
        'customString2Answer': { answer: 'Shakespeare', points: 5 },
        'customInt1Answer': { answer: 8, points: 10 },
        'customCheckbox1Answer': { answer: true, points: 5 }
      };
      
      return await Template.create({
        title: 'General Knowledge Quiz',
        description: 'Test your knowledge with this general knowledge quiz',
        isPublic: true,
        topicId,
        userId,
        isQuiz: true,
        showScoreImmediately: true,
        scoringCriteria: JSON.stringify(scoringCriteria),
        customString1State: true,
        customString1Question: 'What is the capital of France?',
        customString2State: true,
        customString2Question: 'Who wrote "Romeo and Juliet"?',
        customInt1State: true,
        customInt1Question: 'How many planets are in our solar system?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Is water a compound?',
        questionOrder: JSON.stringify(['customString1', 'customString2', 'customInt1', 'customCheckbox1'])
      });
    };
    
    // Quiz template function - Bangla
    const createBanglaQuizTemplate = async (userId: string, topicId: string) => {
      const scoringCriteria = {
        'customString1Answer': { answer: 'ঢাকা', points: 5 },
        'customString2Answer': { answer: 'রবীন্দ্রনাথ ঠাকুর', points: 5 },
        'customInt1Answer': { answer: 1971, points: 10 },
        'customCheckbox1Answer': { answer: true, points: 5 }
      };
      
      return await Template.create({
        title: 'বাংলাদেশ কুইজ', // Bangladesh Quiz
        description: 'বাংলাদেশ সম্পর্কিত প্রশ্ন',
        isPublic: true,
        topicId,
        userId,
        isQuiz: true,
        showScoreImmediately: true,
        scoringCriteria: JSON.stringify(scoringCriteria),
        customString1State: true,
        customString1Question: 'বাংলাদেশের রাজধানী কি?',
        customString2State: true,
        customString2Question: 'রবীন্দ্র সংগীত কে রচনা করেছিলেন?',
        customInt1State: true,
        customInt1Question: 'বাংলাদেশ কত সালে স্বাধীন হয়েছিল?',
        customCheckbox1State: true,
        customCheckbox1Question: 'বাংলাদেশের জাতীয় ফল কি জ্যাকফ্রুট?',
        questionOrder: JSON.stringify(['customString1', 'customString2', 'customInt1', 'customCheckbox1'])
      });
    };

    // Feedback template function - English
    const createEnglishFeedbackTemplate = async (userId: string, topicId: string) => {
      return await Template.create({
        title: 'Customer Feedback Form',
        description: 'Please provide your feedback about our services',
        isPublic: true,
        topicId,
        userId,
        isQuiz: false,
        customText1State: true,
        customText1Question: 'What do you like about our service?',
        customText2State: true,
        customText2Question: 'What areas can we improve?',
        customInt1State: true,
        customInt1Question: 'On a scale of 1-10, how would you rate our service?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Would you recommend us to others?',
        questionOrder: JSON.stringify(['customText1', 'customText2', 'customInt1', 'customCheckbox1'])
      });
    };
    
    // Feedback template function - Bangla
    const createBanglaFeedbackTemplate = async (userId: string, topicId: string) => {
      return await Template.create({
        title: 'মতামত ফর্ম', // Feedback Form
        description: 'আমাদের সেবা সম্পর্কে আপনার মতামত প্রদান করুন',
        isPublic: true,
        topicId,
        userId,
        isQuiz: false,
        customText1State: true,
        customText1Question: 'আমাদের সেবার কোন দিকটি আপনার পছন্দ?',
        customText2State: true,
        customText2Question: 'আমরা কোন দিকে উন্নতি করতে পারি?',
        customInt1State: true,
        customInt1Question: '১-১০ স্কেলে, আমাদের সেবা কেমন রেট করবেন?',
        customCheckbox1State: true,
        customCheckbox1Question: 'আপনি কি অন্যদের কাছে আমাদের সুপারিশ করবেন?',
        questionOrder: JSON.stringify(['customText1', 'customText2', 'customInt1', 'customCheckbox1'])
      });
    };
    
    // Registration template function - English
    const createEnglishRegistrationTemplate = async (userId: string, topicId: string) => {
      return await Template.create({
        title: 'Event Registration Form',
        description: 'Register for our upcoming event',
        isPublic: true,
        topicId,
        userId,
        isQuiz: false,
        customString1State: true,
        customString1Question: 'Full Name',
        customString2State: true,
        customString2Question: 'Email Address',
        customString3State: true,
        customString3Question: 'Organization',
        customText1State: true,
        customText1Question: 'Any special requirements?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Subscribe to newsletter',
        questionOrder: JSON.stringify(['customString1', 'customString2', 'customString3', 'customText1', 'customCheckbox1'])
      });
    };
    
    // Registration template function - Bangla
    const createBanglaRegistrationTemplate = async (userId: string, topicId: string) => {
      return await Template.create({
        title: 'অনুষ্ঠান নিবন্ধন ফর্ম',
        description: 'আমাদের আসন্ন অনুষ্ঠানে নিবন্ধন করুন',
        isPublic: true,
        topicId,
        userId,
        isQuiz: false,
        customString1State: true,
        customString1Question: 'পুরো নাম',
        customString2State: true,
        customString2Question: 'ইমেইল ঠিকানা',
        customString3State: true,
        customString3Question: 'প্রতিষ্ঠান',
        customText1State: true,
        customText1Question: 'কোন বিশেষ প্রয়োজন আছে কি?',
        customCheckbox1State: true,
        customCheckbox1Question: 'নিউজলেটার সাবস্ক্রাইব করুন',
        questionOrder: JSON.stringify(['customString1', 'customString2', 'customString3', 'customText1', 'customCheckbox1'])
      });
    };
    
    // Create templates using a mix of different types
    const templateCreators = [
      createEnglishQuizTemplate, createBanglaQuizTemplate,
      createEnglishFeedbackTemplate, createBanglaFeedbackTemplate,
      createEnglishRegistrationTemplate, createBanglaRegistrationTemplate
    ];
    
    // First create one of each template type to ensure variety
    for (let i = 0; i < templateCreators.length && templates.length < TEMPLATES_COUNT; i++) {
      // Use appropriate users for language-specific templates
      let userId;
      if (i % 2 === 0) { // English templates
        userId = englishUser.id;
      } else { // Bangla templates
        userId = banglaUser.id;
      }
      
      const topicId = topics[i % topics.length].id;
      const template = await templateCreators[i](userId, topicId);
      templates.push(template);
      
      // Add 2-3 tags to template
      const numTags = Math.floor(Math.random() * 2) + 2; // 2 to 3 tags
      const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
        await TemplateTag.create({
          templateId: template.id,
          tagId: shuffledTags[j].id
        });
      }
    }
    
    // Then create more templates if needed to reach the target count
    while (templates.length < TEMPLATES_COUNT) {
      const userId = users[Math.floor(Math.random() * users.length)].id;
      const topicId = topics[Math.floor(Math.random() * topics.length)].id;
      const createTemplate = templateCreators[Math.floor(Math.random() * templateCreators.length)];
      
      const template = await createTemplate(userId, topicId);
      templates.push(template);
      
      // Add 2-3 tags to template
      const numTags = Math.floor(Math.random() * 2) + 2; // 2 to 3 tags
      const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
        await TemplateTag.create({
          templateId: template.id,
          tagId: shuffledTags[j].id
        });
      }
    }
    console.log(`✅ Created ${templates.length} templates with tags`);
    
    // Create Form Responses - limited number per template
    console.log('\nCreating form responses...');
    const responses: FormResponse[] = [];
    
    for (const template of templates) {
      // Fixed number of responses per template
      for (let i = 0; i < RESPONSES_PER_TEMPLATE; i++) {
        const userId = users[i % users.length].id; // Distribute responses among users evenly
        
        // Generate responses based on the language of the template
        const isBanglaTemplate = template.title.includes('বাংলা') || 
                                template.description.includes('বাংলা') ||
                                template.customString1Question?.includes('বাংলা');
        
        let customString1Answer, customString2Answer, customText1Answer, customText2Answer;
        
        if (isBanglaTemplate) {
          const banglaAnswers = ['ঢাকা', 'খুলনা', 'রাজশাহী', 'চট্টগ্রাম', 'সিলেট'];
          const banglaNames = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জসীম উদ্দিন', 'সুকান্ত ভট্টাচার্য'];
          
          customString1Answer = banglaAnswers[i % banglaAnswers.length];
          customString2Answer = banglaNames[i % banglaNames.length];
          customText1Answer = 'এটি একটি বাংলা উত্তর। আমি আপনাদের সেবার মান নিয়ে সন্তুষ্ট।';
          customText2Answer = 'আপনারা খুব ভালো কাজ করছেন। ধন্যবাদ।';
        } else {
          customString1Answer = ['John Doe', 'Jane Smith', 'Alex Johnson'][i % 3];
          customString2Answer = ['example@email.com', 'user@domain.com', 'contact@business.com'][i % 3];
          customText1Answer = 'This is a sample response for testing purposes.';
          customText2Answer = 'Everything looks good. Thanks for the service.';
        }
        
        const response = await FormResponse.create({
          templateId: template.id,
          userId,
          customString1Answer: customString1Answer,
          customString2Answer: customString2Answer,
          customString3Answer: isBanglaTemplate ? 'বাংলাদেশ বিশ্ববিদ্যালয়' : 'Acme Corporation',
          customString4Answer: isBanglaTemplate ? 'টেস্ট' : 'Test',
          customText1Answer: customText1Answer,
          customText2Answer: customText2Answer,
          customInt1Answer: i + 5, // 5, 6, 7 for ratings
          customInt2Answer: (i + 1) * 10, // 10, 20, 30 for other numeric values
          customCheckbox1Answer: i % 2 === 0, // alternating true/false
          customCheckbox2Answer: i % 3 === 0,
          score: template.isQuiz ? (i + 1) * 25 : undefined, // 25, 50, 75 for quiz scores
          totalPossiblePoints: template.isQuiz ? 100 : undefined,
          scoreViewed: template.isQuiz ? true : undefined
        });
        
        responses.push(response);
      }
    }
    console.log(`✅ Created ${responses.length} form responses`);
    
    // Create Comments - limited number per template
    console.log('\nCreating comments...');
    const comments: Comment[] = [];
    
    for (const template of templates) {
      // Fixed number of comments per template
      for (let i = 0; i < COMMENTS_PER_TEMPLATE; i++) {
        const userId = users[i % users.length].id; // Distribute comments among users evenly
        const user = users.find(u => u.id === userId);
        
        // Generate comments based on the user's language preference
        let content;
        if (user?.language === 'bn') {
          const banglaPhrases = [
            'এই ফর্মটি খুব উপকারী!',
            'আমি একটি ভাল অভিজ্ঞতা পেয়েছি।',
            'কিছু প্রশ্ন আরও স্পষ্ট হওয়া দরকার।',
            'এটি ব্যবহার করা খুব সহজ ছিল।'
          ];
          content = banglaPhrases[i % banglaPhrases.length];
        } else {
          const englishPhrases = [
            'This form was very helpful!',
            'I had a great experience with this template.',
            'Some questions could be clearer.',
            'It was very easy to use.'
          ];
          content = englishPhrases[i % englishPhrases.length];
        }
        
        const comment = await Comment.create({
          templateId: template.id,
          userId,
          content
        });
        
        comments.push(comment);
      }
    }
    console.log(`✅ Created ${comments.length} comments`);
    
    // Create Likes - limited number per template
    console.log('\nCreating likes...');
    const likes: Like[] = [];
    
    for (const template of templates) {
      // Ensure we don't try to create more likes than we have users
      const likeCount = Math.min(LIKES_PER_TEMPLATE, users.length);
      
      // Use different users for each template's likes
      for (let i = 0; i < likeCount; i++) {
        // Rotate through users to distribute likes
        const userIndex = (templates.indexOf(template) + i) % users.length;
        const userId = users[userIndex].id;
        
        const like = await Like.create({
          templateId: template.id,
          userId
        });
        
        likes.push(like);
      }
    }
    console.log(`✅ Created ${likes.length} likes`);
    
    console.log('\n=========================================');
    console.log('Database seeding completed successfully! 🎉');
    console.log('=========================================');
    
    // Print summary
    console.log('\n📊 Seed Summary:');
    console.log(`- ${users.length} users (including standard test users)`);
    console.log(`  - admin@example.com / admin123 (Admin user)`);
    console.log(`  - user@example.com / user123 (English user)`);
    console.log(`  - bangla@example.com / user123 (Bangla user)`);
    console.log(`- ${topics.length} topics`);
    console.log(`- ${tags.length} tags`);
    console.log(`- ${templates.length} templates (${templates.filter(t => t.title.includes('বাংলা') || t.description.includes('বাংলা')).length} in Bangla)`);
    console.log(`- ${responses.length} form responses (${RESPONSES_PER_TEMPLATE} per template)`);
    console.log(`- ${comments.length} comments (${COMMENTS_PER_TEMPLATE} per template)`);
    console.log(`- ${likes.length} likes (${LIKES_PER_TEMPLATE} per template maximum)`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    console.log('\nTerminating seed process...');
    process.exit(0);
  }
};

// Run script if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;