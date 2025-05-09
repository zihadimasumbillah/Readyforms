import { sequelize } from '../models';
import { User, Template, Topic, FormResponse, Comment, Like, Tag, TemplateTag } from '../models';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Dropping all tables...');
    await sequelize.drop();

    console.log('Synchronizing database schema...');
    await sequelize.sync({ force: true });

    console.log('Seeding database with initial data...');

    // Define hashed passwords for seed users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const moderatorPassword = await bcrypt.hash('moderator123', 10);

    // Create Topics
    const topics = await Topic.bulkCreate([
      { name: 'Education', description: 'Forms related to education and learning' },
      { name: 'Business', description: 'Forms for business operations and feedback' },
      { name: 'Entertainment', description: 'Fun and entertainment forms' },
      { name: 'Quizzes', description: 'Knowledge tests and surveys' },
      { name: 'Research', description: 'Forms for academic and market research' },
      { name: 'Healthcare', description: 'Medical forms and health surveys' },
      { name: 'Event Planning', description: 'RSVPs and event feedback forms' },
    ]);

    // Create Users with various roles
    const users = await User.bulkCreate([
      { 
        name: 'Admin User', 
        email: 'admin@example.com', 
        password: adminPassword, 
        isAdmin: true,
        language: 'en',
        theme: 'light',
        lastLoginAt: new Date()
      },
      { 
        name: 'Regular User', 
        email: 'user@example.com', 
        password: userPassword, 
        isAdmin: false,
        language: 'en',
        theme: 'dark',
        lastLoginAt: new Date()
      },
      {
        name: 'Moderator User',
        email: 'moderator@example.com',
        password: moderatorPassword,
        isAdmin: false,
        language: 'en',
        theme: 'system',
        lastLoginAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: await bcrypt.hash('inactive123', 10),
        isAdmin: false,
        language: 'fr',
        theme: 'dark',
        lastLoginAt: new Date(Date.now() - 30 * 86400000) // 30 days ago
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10),
        isAdmin: false,
        language: 'es',
        theme: 'light',
        lastLoginAt: new Date(Date.now() - 2 * 86400000) // 2 days ago
      }
    ]);

    // Create Tags for better categorization
    const tags = await Tag.bulkCreate([
      { name: 'Popular' },
      { name: 'Education' },
      { name: 'Feedback' },
      { name: 'Survey' },
      { name: 'Knowledge' },
      { name: 'Programming' },
      { name: 'Science' },
      { name: 'History' },
      { name: 'Customer' },
      { name: 'Evaluation' },
      { name: 'Beginner' },
      { name: 'Advanced' },
      { name: 'Short' },
      { name: 'Detailed' }
    ]);

    // Create Templates with varied structures and types
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
        allowedUsers: JSON.stringify([users[1].id, users[2].id]), // Only specific users can see this
        customString1State: true,
        customString1Question: 'What is your current job title?',
        customText1State: true,
        customText1Question: 'Describe your educational background',
        questionOrder: JSON.stringify([
          'customString1',
          'customText1'
        ])
      },
      {
        title: 'Science Knowledge Test',
        description: 'Test your understanding of basic scientific concepts',
        isPublic: true,
        topicId: topics[3].id,
        userId: users[2].id,
        isQuiz: true,
        showScoreImmediately: false,
        scoringCriteria: JSON.stringify({
          'customString1Answer': { answer: 'H2O', points: 5 },
          'customString2Answer': { answer: 'Oxygen', points: 5 },
          'customInt1Answer': { answer: 299792458, points: 10 },
          'customCheckbox1Answer': { answer: true, points: 5 }
        }),
        customString1State: true,
        customString1Question: 'What is the chemical formula for water?',
        customString2State: true,
        customString2Question: 'What gas do plants produce during photosynthesis?',
        customInt1State: true,
        customInt1Question: 'What is the speed of light in meters per second?',
        customCheckbox1State: true,
        customCheckbox1Question: 'Is gravity a fundamental force?',
        questionOrder: JSON.stringify([
          'customString1',
          'customString2',
          'customInt1',
          'customCheckbox1'
        ])
      },
      {
        title: 'Event Registration Form',
        description: 'Register for our upcoming tech conference',
        isPublic: true,
        topicId: topics[6].id,
        userId: users[1].id,
        isQuiz: false,
        customString1State: true,
        customString1Question: 'Full Name',
        customString2State: true,
        customString2Question: 'Email Address',
        customString3State: true,
        customString3Question: 'Company',
        customString4State: true,
        customString4Question: 'Job Title',
        customText1State: true,
        customText1Question: 'Dietary Restrictions',
        customCheckbox1State: true,
        customCheckbox1Question: 'Will you attend the networking dinner?',
        questionOrder: JSON.stringify([
          'customString1',
          'customString2',
          'customString3',
          'customString4',
          'customText1',
          'customCheckbox1'
        ])
      },
      {
        title: 'Health Assessment',
        description: 'Basic health questionnaire for new patients',
        isPublic: true,
        topicId: topics[5].id,
        userId: users[0].id,
        isQuiz: false,
        customInt1State: true,
        customInt1Question: 'What is your age?',
        customInt2State: true,
        customInt2Question: 'Height in cm',
        customInt3State: true,
        customInt3Question: 'Weight in kg',
        customCheckbox1State: true,
        customCheckbox1Question: 'Do you smoke?',
        customCheckbox2State: true,
        customCheckbox2Question: 'Do you drink alcohol?',
        customText1State: true,
        customText1Question: 'List any current medications',
        customText2State: true,
        customText2Question: 'List any allergies',
        questionOrder: JSON.stringify([
          'customInt1',
          'customInt2',
          'customInt3',
          'customCheckbox1',
          'customCheckbox2',
          'customText1',
          'customText2'
        ])
      }
    ]);

    // Connect Templates with Tags
    await TemplateTag.bulkCreate([
      { templateId: templates[0].id, tagId: tags[3].id }, // Basic Quiz - Survey
      { templateId: templates[0].id, tagId: tags[4].id }, // Basic Quiz - Knowledge
      { templateId: templates[0].id, tagId: tags[0].id }, // Basic Quiz - Popular
      { templateId: templates[0].id, tagId: tags[10].id }, // Basic Quiz - Beginner

      { templateId: templates[1].id, tagId: tags[2].id }, // Customer Feedback - Feedback
      { templateId: templates[1].id, tagId: tags[8].id }, // Customer Feedback - Customer
      { templateId: templates[1].id, tagId: tags[12].id }, // Customer Feedback - Short

      { templateId: templates[2].id, tagId: tags[5].id }, // Programming Language Quiz - Programming
      { templateId: templates[2].id, tagId: tags[4].id }, // Programming Language Quiz - Knowledge
      { templateId: templates[2].id, tagId: tags[11].id }, // Programming Language Quiz - Advanced
      
      { templateId: templates[3].id, tagId: tags[1].id }, // Private Survey - Education
      { templateId: templates[3].id, tagId: tags[13].id }, // Private Survey - Detailed
      
      { templateId: templates[4].id, tagId: tags[6].id }, // Science Knowledge Test - Science
      { templateId: templates[4].id, tagId: tags[4].id }, // Science Knowledge Test - Knowledge
      
      { templateId: templates[5].id, tagId: tags[6].id }, // Event Registration - Event
      { templateId: templates[5].id, tagId: tags[13].id }, // Event Registration - Detailed
      
      { templateId: templates[6].id, tagId: tags[9].id }, // Health Assessment - Evaluation
      { templateId: templates[6].id, tagId: tags[13].id }, // Health Assessment - Detailed
    ]);

    // Create Form Responses
    await FormResponse.bulkCreate([
      {
        templateId: templates[0].id,
        userId: users[1].id,
        customString1Answer: 'Paris',
        customString2Answer: 'Jupiter',
        customInt1Answer: 1945,
        customCheckbox1Answer: true,
        score: 25,
        totalPossiblePoints: 25,
        scoreViewed: true
      },
      {
        templateId: templates[0].id,
        userId: users[0].id,
        customString1Answer: 'London',
        customString2Answer: 'Jupiter',
        customInt1Answer: 1944,
        customCheckbox1Answer: true,
        score: 10,
        totalPossiblePoints: 25,
        scoreViewed: false
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
        totalPossiblePoints: 30,
        scoreViewed: true
      },
      {
        templateId: templates[2].id,
        userId: users[2].id,
        customString1Answer: 'Brendan Eich',
        customString2Answer: 'Larry Wall',
        customString3Answer: '1996',
        customCheckbox1Answer: true,
        score: 15,
        totalPossiblePoints: 30,
        scoreViewed: true
      },
      {
        templateId: templates[4].id,
        userId: users[3].id,
        customString1Answer: 'H2O',
        customString2Answer: 'Carbon dioxide',
        customInt1Answer: 300000000,
        customCheckbox1Answer: true,
        score: 10,
        totalPossiblePoints: 25,
        scoreViewed: false
      },
      {
        templateId: templates[5].id,
        userId: users[0].id,
        customString1Answer: 'Jane Smith',
        customString2Answer: 'jane@example.com',
        customString3Answer: 'Acme Corp',
        customString4Answer: 'Developer',
        customText1Answer: 'Vegetarian',
        customCheckbox1Answer: true
      },
      {
        templateId: templates[5].id,
        userId: users[1].id,
        customString1Answer: 'John Doe',
        customString2Answer: 'john@example.com',
        customString3Answer: 'XYZ Inc',
        customString4Answer: 'Manager',
        customText1Answer: 'No restrictions',
        customCheckbox1Answer: false
      },
      {
        templateId: templates[6].id,
        userId: users[2].id,
        customInt1Answer: 35,
        customInt2Answer: 175,
        customInt3Answer: 70,
        customCheckbox1Answer: false,
        customCheckbox2Answer: true,
        customText1Answer: 'None',
        customText2Answer: 'Penicillin'
      }
    ]);

    // Create Comments
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
      },
      {
        templateId: templates[0].id,
        userId: users[2].id,
        content: 'Good for beginners, but could include more challenging questions.'
      },
      {
        templateId: templates[2].id,
        userId: users[0].id,
        content: 'This quiz is very informative for programming enthusiasts.'
      },
      {
        templateId: templates[4].id,
        userId: users[1].id,
        content: 'Science questions are well structured but quite difficult!'
      },
      {
        templateId: templates[5].id,
        userId: users[3].id,
        content: 'Excellent event registration form, covers all the necessary details.'
      },
      {
        templateId: templates[6].id,
        userId: users[4].id,
        content: 'Great health assessment form, though you might want to add more lifestyle questions.'
      }
    ]);

    // Create Likes
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
      },
      {
        templateId: templates[0].id,
        userId: users[2].id
      },
      {
        templateId: templates[0].id,
        userId: users[3].id
      },
      {
        templateId: templates[2].id,
        userId: users[0].id
      },
      {
        templateId: templates[2].id,
        userId: users[2].id
      },
      {
        templateId: templates[2].id,
        userId: users[3].id
      },
      {
        templateId: templates[4].id,
        userId: users[0].id
      },
      {
        templateId: templates[4].id,
        userId: users[1].id
      },
      {
        templateId: templates[5].id,
        userId: users[2].id
      },
      {
        templateId: templates[6].id,
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