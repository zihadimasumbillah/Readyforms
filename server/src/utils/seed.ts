import { sequelize } from '../models';
import { User, Template, Topic, FormResponse, Comment, Like } from '../models';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Dropping all tables...');
    await sequelize.drop();

    console.log('Synchronizing database schema...');
    await sequelize.sync({ force: true });

    console.log('Seeding database with initial data...');

    const topics = await Topic.bulkCreate([
      { name: 'Education', description: 'Forms related to education' },
      { name: 'Business', description: 'Forms for business purposes' },
      { name: 'Entertainment', description: 'Fun and entertainment forms' },
      { name: 'Quizzes', description: 'Knowledge tests and surveys' },
    ]);

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await User.bulkCreate([
      { 
        name: 'Admin User', 
        email: 'admin@example.com', 
        password: adminPassword, 
        isAdmin: true,
        language: 'en',
        theme: 'light'
      },
      { 
        name: 'Regular User', 
        email: 'user@example.com', 
        password: userPassword, 
        isAdmin: false,
        language: 'en',
        theme: 'dark'
      },
    ]);

    const templates = await Template.bulkCreate([
      {
        title: 'Basic Quiz',
        description: 'A sample quiz with automatic scoring',
        isPublic: true,
        topicId: topics[3].id,
        userId: users[0].id,
        isQuiz: true,
        showScoreImmediately: true,
        scoringCriteria: JSON.stringify({
          'customString1Answer': { answer: 'Paris', points: 5 },
          'customString2Answer': { answer: 'Jupiter', points: 5 },
          'customInt1Answer': { answer: 1945, points: 10 },
          'customCheckbox1Answer': { answer: true, points: 5 },
        }),
        customString1State: true,
        customString1Question: 'What is the capital of France?',
        customString2State: true,
        customString2Question: 'What is the largest planet in our solar system?',
        customInt1State: true,
        customInt1Question: 'In what year did World War II end?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Is the Earth round?',
        questionOrder: JSON.stringify([
          'customString1',
          'customString2',
          'customInt1',
          'customCheckbox1'
        ])
      },
      {
        title: 'Customer Feedback Form',
        description: 'A simple feedback form for gathering customer opinions',
        isPublic: true,
        topicId: topics[1].id,
        userId: users[1].id,
        isQuiz: false,
        customText1State: true,
        customText1Question: 'How would you describe your experience with our product?',
        customInt1State: true,
        customInt1Question: 'On a scale of 1-10, how would you rate our service?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Would you recommend us to others?',
        questionOrder: JSON.stringify([
          'customText1',
          'customInt1',
          'customCheckbox1'
        ])
      },
      {
        title: 'Programming Language Quiz',
        description: 'Test your knowledge of programming languages',
        isPublic: true,
        topicId: topics[0].id,
        userId: users[0].id,
        isQuiz: true,
        showScoreImmediately: true,
        scoringCriteria: JSON.stringify({
          'customString1Answer': { answer: 'Brendan Eich', points: 10 },
          'customString2Answer': { answer: 'Guido van Rossum', points: 10 },
          'customString3Answer': { answer: '1995', points: 5 },
          'customCheckbox1Answer': { answer: true, points: 5 }
        }),
        customString1State: true,
        customString1Question: 'Who created JavaScript?',
        customString2State: true,
        customString2Question: 'Who created Python?',
        customString3State: true,
        customString3Question: 'In what year was Java released?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Is TypeScript a superset of JavaScript?',
        questionOrder: JSON.stringify([
          'customString1',
          'customString2',
          'customString3',
          'customCheckbox1'
        ])
      },
      {
        title: 'Private Survey',
        description: 'A private survey only visible to selected users',
        isPublic: false,
        topicId: topics[0].id,
        userId: users[0].id,
        isQuiz: false,
        allowedUsers: JSON.stringify([users[1].id]), // Only the regular user can see this
        customString1State: true,
        customString1Question: 'What is your current job title?',
        customText1State: true,
        customText1Question: 'Describe your educational background',
        questionOrder: JSON.stringify([
          'customString1',
          'customText1'
        ])
      }
    ]);

    await FormResponse.bulkCreate([
      {
        templateId: templates[0].id,
        userId: users[1].id,
        customString1Answer: 'Paris',
        customString2Answer: 'Jupiter',
        customInt1Answer: 1945,
        customCheckbox1Answer: true,
        score: 25,
        totalPossiblePoints: 25
      },
      {
        templateId: templates[0].id,
        userId: users[0].id,
        customString1Answer: 'London',
        customString2Answer: 'Jupiter',
        customInt1Answer: 1944,
        customCheckbox1Answer: true,
        score: 10,
        totalPossiblePoints: 25
      },
      {
        templateId: templates[1].id,
        userId: users[0].id,
        customText1Answer: 'Great experience overall, very satisfied!',
        customInt1Answer: 9,
        customCheckbox1Answer: true
      },
      {
        templateId: templates[2].id,
        userId: users[1].id,
        customString1Answer: 'Brendan Eich',
        customString2Answer: 'Guido van Rossum',
        customString3Answer: '1995',
        customCheckbox1Answer: true,
        score: 30,
        totalPossiblePoints: 30
      }
    ]);

    await Comment.bulkCreate([
      {
        templateId: templates[0].id,
        userId: users[1].id,
        content: 'This is a great quiz, I learned a lot!'
      },
      {
        templateId: templates[1].id,
        userId: users[0].id,
        content: 'Nice feedback form, very straightforward'
      },
      {
        templateId: templates[2].id,
        userId: users[1].id,
        content: 'Some of these questions are tricky!'
      }
    ]);

    await Like.bulkCreate([
      {
        templateId: templates[0].id,
        userId: users[1].id
      },
      {
        templateId: templates[1].id,
        userId: users[0].id
      },
      {
        templateId: templates[2].id,
        userId: users[1].id
      }
    ]);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();