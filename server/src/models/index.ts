import { Sequelize } from 'sequelize-typescript';
import User from './User';
import { Topic } from './Topic';
import { Template } from './Template';
import { FormResponse } from './FormResponse';
import { Comment } from './Comment';
import { Like } from './Like';
import { Tag } from './Tag';
import { TemplateTag } from './TemplateTag';
import config from '../config/db.config';
import 'pg';

const sequelize = new Sequelize({
  ...config,
  models: [User, Topic, Template, FormResponse, Comment, Like, Tag, TemplateTag]
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
    return true;
  } catch (error) {
    console.error('Failed to sync database:', error);
    return false;
  }
};

export {
  sequelize,
  User,
  Topic,
  Template,
  FormResponse,
  Comment,
  Like,
  Tag,
  TemplateTag
};