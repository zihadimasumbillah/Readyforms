import { Template, User, Topic, Tag, TemplateTag } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

// Debug templates in the database
async function debugTemplates() {
  try {
    console.log('========= Template Debug Utility =========');
    console.log('Connecting to database...');
    
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1);
    }
    
    console.log('\n--- Template Model Info ---');
    const templateAttrs = Object.keys(Template.getAttributes());
    console.log('Template attributes:', templateAttrs);
    
    console.log('\n--- Topic Model Info ---');
    const topicAttrs = Object.keys(Topic.getAttributes());
    console.log('Topic attributes:', topicAttrs);
    
    console.log('\n--- Tag Model Info ---');
    const tagAttrs = Object.keys(Tag.getAttributes());
    console.log('Tag attributes:', tagAttrs);
    
    console.log('\n--- Database Statistics ---');
    const userCount = await User.count();
    const topicCount = await Topic.count();
    const templateCount = await Template.count();
    const tagCount = await Tag.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Topics: ${topicCount}`);
    console.log(`Templates: ${templateCount}`);
    console.log(`Tags: ${tagCount}`);
    
    if (templateCount === 0) {
      console.log('\n--- No Templates Found ---');
      console.log('Creating a sample template for testing...');
      
      const users = await User.findAll({ limit: 1 });
      const topics = await Topic.findAll({ limit: 1 });
      
      if (users.length === 0) {
        console.log('No users found. Please create a user first.');
        process.exit(1);
      }
      
      if (topics.length === 0) {
        console.log('No topics found. Please create a topic first.');
        process.exit(1);
      }
      
      const firstTopic = topics[0] as any; // Cast to any to access the id property
      const sampleTemplate = await Template.create({
        title: 'Debug Template',
        description: 'Created by debug utility',
        isPublic: true,
        topicId: firstTopic.id,
        userId: users[0].id,
        customString1State: true,
        customString1Question: 'Debug question?',
        questionOrder: JSON.stringify(['customString1'])
      });
      
      console.log('Sample template created:', sampleTemplate.id);
      
      // Create a sample tag
      const [tag] = await Tag.findOrCreate({
        where: { name: 'debug-tag' },
        defaults: { name: 'debug-tag' }
      });
      
      // Associate tag with template
      await TemplateTag.create({
        tagId: tag.id,
        templateId: sampleTemplate.id
      });
      
      console.log('Sample tag created and associated with template');
    } else {
      console.log('\n--- Recent Templates ---');
      const templates = await Template.findAll({
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Topic, attributes: ['id', 'name'] },
          { model: Tag }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      for (const template of templates) {
        console.log(`\nTemplate ID: ${template.id}`);
        console.log(`Title: ${template.title}`);
        console.log(`Created: ${template.createdAt}`);
        console.log(`User: ${template.user ? template.user.name : 'Unknown'}`);
        console.log(`Topic: ${template.topic ? (template.topic as any).name : 'Unknown'}`);
        console.log(`Tags: ${(template as any).tags?.map(tag => tag.name).join(', ') || 'None'}`);
        
        // Check for any issues with the template
        const validationResult = await validateTemplate(template);
        if (!validationResult.isValid) {
          console.log('⚠️ Issues:', validationResult.issues.join(', '));
          
          // Attempt to fix common issues
          if (validationResult.issues.includes('Missing questionOrder')) {
            console.log('Fixing missing questionOrder...');
            await template.update({ questionOrder: '[]' });
          }
        } else {
          console.log('✅ No issues detected');
        }
      }
      
      console.log('\n--- Template Tag Associations ---');
      const tagAssociations = await TemplateTag.findAll({
        limit: 10,
        include: [
          { model: Template, attributes: ['id', 'title'] },
          { model: Tag, attributes: ['id', 'name'] }
        ]
      });
      
      if (tagAssociations.length === 0) {
        console.log('No template-tag associations found');
      } else {
        for (const assoc of tagAssociations) {
          console.log(`Template ID "${assoc.templateId}" - Tag ID "${assoc.tagId}"`);
        }
      }
    }
    
    console.log('\n========= Debug Complete =========');
    process.exit(0);
  } catch (error) {
    console.error('Error in debugTemplates:', error);
    process.exit(1);
  }
}

// Check for template issues
export const validateTemplate = async (template: Template) => {
  try {
    const issues: Array<string> = []; // Fix the type here
    
    if (!template.title) issues.push('Missing title');
    if (!template.topicId) issues.push('Missing topicId');
    if (!template.userId) issues.push('Missing userId');
    if (template.questionOrder === null) issues.push('Missing questionOrder');
    
    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Error in validateTemplate:', error);
    return {
      isValid: false,
      issues: ['Validation failed due to an error']
    };
  }
};

// Run if executed directly
if (require.main === module) {
  debugTemplates();
}

export default debugTemplates;
