import { User, Topic, Template, FormResponse, Comment, Like } from '../models';
import { syncDatabase } from '../models';

interface UserCollection {
  adminUser: User;
  regularUser1: User;
  regularUser2: User;
}

interface TemplateCollection {
  adminTemplate: Template;
  userTemplate1: Template;
  userTemplate2: Template;
  educationalTemplate: Template;
}

/**
 * Create default users
 */
async function createUsers(): Promise<UserCollection> {
  console.log('Creating default users...');
  
  // Create admin user
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Password123!',
    isAdmin: true,
    language: 'en',
    theme: 'light'
  });
  
  // Create regular users
  const regularUser1 = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    language: 'en',
    theme: 'light'
  });
  
  const regularUser2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123!',
    language: 'bn',
    theme: 'dark'
  });

  console.log('Default users created successfully!');
  
  return {
    adminUser,
    regularUser1,
    regularUser2
  };
}

/**
 * Create default topics
 */
async function createTopics(): Promise<Topic[]> {
  console.log('Creating default topics...');
  
  const topics = await Promise.all([
    Topic.create({
      name: 'Education',
      description: 'Educational forms, quizzes, and surveys'
    }),
    Topic.create({
      name: 'Business',
      description: 'Business-related forms and questionnaires'
    }),
    Topic.create({
      name: 'Entertainment',
      description: 'Fun quizzes and polls'
    }),
    Topic.create({
      name: 'Feedback',
      description: 'Forms for gathering user feedback'
    }),
    Topic.create({
      name: 'Research',
      description: 'Forms for research and data collection'
    })
  ]);
  
  console.log('Default topics created successfully!');
  
  return topics;
}

/**
 * Create sample templates
 */
async function createTemplates(users: UserCollection, topics: Topic[]): Promise<TemplateCollection> {
  console.log('Creating sample templates...');
  
  // Create a public template by admin
  const adminTemplate = await Template.create({
    title: 'Customer Satisfaction Survey',
    description: 'Gather feedback from customers about their experience with your products or services.',
    userId: users.adminUser.id,
    topicId: topics[3].id, // Feedback topic
    isPublic: true,
    customString1State: true,
    customString1Question: 'What product or service did you purchase?',
    customInt1State: true,
    customInt1Question: 'On a scale from 1 to 10, how would you rate our service?',
    customText1State: true,
    customText1Question: 'What did you like most about our product/service?',
    customText2State: true,
    customText2Question: 'What could we improve?',
    customCheckbox1State: true,
    customCheckbox1Question: 'Would you recommend our product/service to others?',
    questionOrder: JSON.stringify([
      'customString1', 
      'customInt1', 
      'customText1', 
      'customText2', 
      'customCheckbox1'
    ])
  });
  
  // Create a public template by regular user
  const userTemplate1 = await Template.create({
    title: 'Event Registration Form',
    description: 'Collect information from participants for your upcoming event.',
    userId: users.regularUser1.id,
    topicId: topics[1].id, // Business topic
    isPublic: true,
    customString1State: true,
    customString1Question: 'Full Name',
    customString2State: true,
    customString2Question: 'Organization',
    customString3State: true,
    customString3Question: 'Phone Number',
    customText1State: true,
    customText1Question: 'Special Requirements',
    customCheckbox1State: true,
    customCheckbox1Question: 'Will you attend the networking dinner?',
    questionOrder: JSON.stringify([
      'customString1', 
      'customString2', 
      'customString3', 
      'customText1', 
      'customCheckbox1'
    ])
  });
  
  // Create a restricted template by regular user
  const userTemplate2 = await Template.create({
    title: 'Team Feedback Form',
    description: 'Provide anonymous feedback for team members.',
    userId: users.regularUser2.id,
    topicId: topics[1].id, // Business topic
    isPublic: false,
    allowedUsers: JSON.stringify([users.regularUser1.id, users.adminUser.id]),
    customString1State: true,
    customString1Question: 'Team Member Name',
    customInt1State: true,
    customInt1Question: 'Rate collaboration skills (1-10)',
    customInt2State: true,
    customInt2Question: 'Rate technical skills (1-10)',
    customText1State: true,
    customText1Question: 'What are this person\'s strengths?',
    customText2State: true,
    customText2Question: 'What areas could this person improve?',
    questionOrder: JSON.stringify([
      'customString1', 
      'customInt1', 
      'customInt2', 
      'customText1', 
      'customText2'
    ])
  });

  // Create an educational quiz template
  const educationalTemplate = await Template.create({
    title: 'Basic Geography Quiz',
    description: 'Test your knowledge of world geography with this simple quiz.',
    userId: users.regularUser1.id,
    topicId: topics[0].id, // Education topic
    isPublic: true,
    customString1State: true,
    customString1Question: 'What is the capital of France?',
    customString2State: true,
    customString2Question: 'Which ocean is the largest by area?',
    customString3State: true,
    customString3Question: 'What is the tallest mountain in the world?',
    customString4State: true,
    customString4Question: 'Which river is the longest in the world?',
    questionOrder: JSON.stringify([
      'customString1',
      'customString2',
      'customString3',
      'customString4'
    ])
  });
  
  console.log('Sample templates created successfully!');
  
  return {
    adminTemplate,
    userTemplate1,
    userTemplate2,
    educationalTemplate
  };
}

/**
 * Create sample form responses
 */
async function createFormResponses(users: UserCollection, templates: TemplateCollection): Promise<void> {
  console.log('Creating sample form responses...');
  
  // Response to admin template by regular user 1
  await FormResponse.create({
    userId: users.regularUser1.id,
    templateId: templates.adminTemplate.id,
    customString1Answer: 'Premium Subscription',
    customInt1Answer: 9,
    customText1Answer: 'The customer service was excellent and responsive.',
    customText2Answer: 'Add more customization options.',
    customCheckbox1Answer: true
  });
  
  // Response to admin template by regular user 2
  await FormResponse.create({
    userId: users.regularUser2.id,
    templateId: templates.adminTemplate.id,
    customString1Answer: 'Basic Plan',
    customInt1Answer: 7,
    customText1Answer: 'Easy to use interface.',
    customText2Answer: 'Loading times could be improved.',
    customCheckbox1Answer: true
  });
  
  // Response to user template 1 by admin
  await FormResponse.create({
    userId: users.adminUser.id,
    templateId: templates.userTemplate1.id,
    customString1Answer: 'Admin User',
    customString2Answer: 'ReadyForms Inc.',
    customString3Answer: '+1234567890',
    customText1Answer: 'Vegetarian meal option.',
    customCheckbox1Answer: true
  });
  
  // Response to educational template by user 2
  await FormResponse.create({
    userId: users.regularUser2.id,
    templateId: templates.educationalTemplate.id,
    customString1Answer: 'Paris',
    customString2Answer: 'Pacific Ocean',
    customString3Answer: 'Mount Everest',
    customString4Answer: 'Nile River'
  });
  
  console.log('Sample form responses created successfully!');
}

/**
 * Create sample comments
 */
async function createComments(users: UserCollection, templates: TemplateCollection): Promise<void> {
  console.log('Creating sample comments...');
  
  // Comments on admin template
  await Comment.create({
    userId: users.regularUser1.id,
    templateId: templates.adminTemplate.id,
    content: 'This is a really useful survey template! Well designed questions.'
  });
  
  await Comment.create({
    userId: users.regularUser2.id,
    templateId: templates.adminTemplate.id,
    content: 'I used this for my business and got great insights from my customers.'
  });
  
  // Comments on user template 1
  await Comment.create({
    userId: users.adminUser.id,
    templateId: templates.userTemplate1.id,
    content: 'Perfect template for event planning. Thanks for sharing!'
  });
  
  console.log('Sample comments created successfully!');
}

/**
 * Create sample likes
 */
async function createLikes(users: UserCollection, templates: TemplateCollection): Promise<void> {
  console.log('Creating sample likes...');
  
  // Likes for admin template
  await Like.create({
    userId: users.regularUser1.id,
    templateId: templates.adminTemplate.id
  });
  
  await Like.create({
    userId: users.regularUser2.id,
    templateId: templates.adminTemplate.id
  });
  
  // Like for user template 1
  await Like.create({
    userId: users.adminUser.id,
    templateId: templates.userTemplate1.id
  });
  
  // Like for educational template
  await Like.create({
    userId: users.adminUser.id,
    templateId: templates.educationalTemplate.id
  });
  
  await Like.create({
    userId: users.regularUser1.id,
    templateId: templates.educationalTemplate.id
  });
  
  console.log('Sample likes created successfully!');
}

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  try {
    // Force sync database (warning: this will drop all tables!)
    await syncDatabase(true);
    
    // Create data in sequence
    const users = await createUsers();
    const topics = await createTopics();
    const templates = await createTemplates(users, topics);
    await createFormResponses(users, templates);
    await createComments(users, templates);
    await createLikes(users, templates);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();