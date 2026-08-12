import sequelizeConnection from '../config/database';
import User from './User';
import Template from './Template';
import FormResponse from './FormResponse';
import Topic from './Topic';
import Comment from './Comment';
import Like from './Like';
import Tag from './Tag';
import TemplateTag from './TemplateTag';
import { Sequelize } from 'sequelize';


const models = {
  User,
  Template,
  FormResponse,
  Topic,
  Comment,
  Like,
  Tag,
  TemplateTag
};

let isInitialized = false;

let initializedSequelize: any = null;

/**
 * @param sequelize 
 * @returns The sequelize instance that was used
 */
export const initializeModels = (sequelize: any): any => {
  // If already initialized, return the previously used instance
  if (isInitialized && initializedSequelize) {
    return initializedSequelize;
  }
  
  if (!sequelize) {
    throw new Error('No sequelize instance provided for model initialization');
  }

  try {
    // Ensure Sequelize constructor is available on the instance
    const Seq = sequelize.Sequelize || require('sequelize').Sequelize;
    
    // Set up static properties on all models to ensure they work with both
    // sequelize and sequelize-typescript approaches
    Object.values(models).forEach((model: any) => {
      // Attach the sequelize instance to each model
      model.sequelize = sequelize;
      
      // Ensure Sequelize constructor is available
      model.Sequelize = Seq;
      
      // Add queryInterface accessor if missing - critical for tests
      if (!Object.getOwnPropertyDescriptor(model, 'queryInterface')) {
        Object.defineProperty(model, 'queryInterface', {
          get: function() { return sequelize.getQueryInterface(); }
        });
      }
      
      // Add queryGenerator accessor if missing
      if (!Object.getOwnPropertyDescriptor(model, 'queryGenerator')) {
        Object.defineProperty(model, 'queryGenerator', {
          get: function() { return sequelize.getQueryInterface().queryGenerator; }
        });
      }
    });
    
    // Initialize each model explicitly
    Object.entries(models).forEach(([name, model]: [string, any]) => {
      try {
        if (typeof model.initialize === 'function') {
          model.initialize(sequelize);
        } else if (typeof model.init === 'function') {
          if (!model.sequelize) {
            model.sequelize = sequelize;
          }
        } else {
          console.warn(`[MODELS] Model ${name} is missing initialization methods — check class definition`);
        }
      } catch (modelError) {
        console.error(`[MODELS] Error initializing model ${name}:`, modelError);
      }
    });
    
    // Define associations - use try/catch for each to avoid failing entirely
    try {
      // User associations
      User.hasMany(Template, { foreignKey: 'userId' });
      User.hasMany(FormResponse, { foreignKey: 'userId' });
      User.hasMany(Comment, { foreignKey: 'userId' });
      User.hasMany(Like, { foreignKey: 'userId' });
    } catch (e) {
      console.warn('Error setting up User associations:', e);
    }

    try {
      // Template associations
      Template.belongsTo(User, { foreignKey: 'userId' });
      Template.belongsTo(Topic, { foreignKey: 'topicId' });
      Template.hasMany(FormResponse, { foreignKey: 'templateId' });
      Template.hasMany(Comment, { foreignKey: 'templateId' });
      Template.hasMany(Like, { foreignKey: 'templateId' });
      Template.belongsToMany(Tag, { through: TemplateTag, foreignKey: 'templateId' });
    } catch (e) {
      console.warn('Error setting up Template associations:', e);
    }

    try {
      // Topic associations
      Topic.hasMany(Template, { foreignKey: 'topicId' });
    } catch (e) {
      console.warn('Error setting up Topic associations:', e);
    }

    try {
      // FormResponse associations
      FormResponse.belongsTo(Template, { foreignKey: 'templateId' });
      FormResponse.belongsTo(User, { foreignKey: 'userId' });
    } catch (e) {
      console.warn('Error setting up FormResponse associations:', e);
    }

    try {
      // Comment associations
      Comment.belongsTo(Template, { foreignKey: 'templateId' });
      Comment.belongsTo(User, { foreignKey: 'userId' });
    } catch (e) {
      console.warn('Error setting up Comment associations:', e);
    }

    try {
      // Like associations
      Like.belongsTo(Template, { foreignKey: 'templateId' });
      Like.belongsTo(User, { foreignKey: 'userId' });
    } catch (e) {
      console.warn('Error setting up Like associations:', e);
    }

    try {
      // Tag associations
      Tag.belongsToMany(Template, { through: TemplateTag, foreignKey: 'tagId' });
    } catch (e) {
      console.warn('Error setting up Tag associations:', e);
    }

    // Mark as initialized and store the sequelize instance
    isInitialized = true;
    initializedSequelize = sequelize;
    console.info('[MODELS] All models and associations initialized successfully.');
    
    return sequelize;
  } catch (error) {
    console.error('Failed to initialize models:', error);
    throw error;
  }
};

// Only initialize with default connection if not in a test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    initializeModels(sequelizeConnection);
  } catch (error) {
    console.error('[MODELS] Failed to initialize models with default sequelize instance:', error);
  }
}

// Export sequelize instance and each model individually as named exports
export { sequelizeConnection as sequelize };
export { User, Template, FormResponse, Topic, Comment, Like, Tag, TemplateTag };

// Export default models object
export default models;