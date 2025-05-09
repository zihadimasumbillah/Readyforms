import { Sequelize } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Template from './Template';
import FormResponse from './FormResponse';
import Comment from './Comment';
import Like from './Like';
import Topic from './Topic';
import Tag from './Tag';
import TemplateTag from './TemplateTag';

const models = {
  User,
  Template,
  FormResponse,
  Comment,
  Like,
  Topic,
  Tag,
  TemplateTag
};

Object.values(models).forEach((model: any) => {
  if (model.initialize) {
    model.initialize(sequelize);
  }
});

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Define model associations
User.hasMany(Template, { foreignKey: 'userId' });
Template.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FormResponse, { foreignKey: 'userId' });
FormResponse.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

Template.hasMany(FormResponse, { foreignKey: 'templateId' });
FormResponse.belongsTo(Template, { foreignKey: 'templateId' });

Template.hasMany(Comment, { foreignKey: 'templateId' });
Comment.belongsTo(Template, { foreignKey: 'templateId' });

Template.hasMany(Like, { foreignKey: 'templateId' });
Like.belongsTo(Template, { foreignKey: 'templateId' });

Topic.hasMany(Template, { foreignKey: 'topicId' });
Template.belongsTo(Topic, { foreignKey: 'topicId' });

// Many-to-many relationship between Template and Tag
Template.belongsToMany(Tag, { through: TemplateTag, foreignKey: 'templateId' });
Tag.belongsToMany(Template, { through: TemplateTag, foreignKey: 'tagId' });

/**
 * Synchronize all models with the database
 * @param force If true, each model will run DROP TABLE IF EXISTS before creating the table
 * @returns Promise that resolves when sync is complete
 */
export const syncModels = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('Models synchronized with database successfully');
  } catch (error) {
    console.error('Error synchronizing models with database:', error);
    throw error;
  }
};

export {
  sequelize,
  User,
  Template,
  FormResponse,
  Comment,
  Like,
  Topic,
  Tag,
  TemplateTag
};

export default {
  sequelize,
  User,
  Template,
  FormResponse,
  Comment,
  Like,
  Topic,
  Tag,
  TemplateTag
};