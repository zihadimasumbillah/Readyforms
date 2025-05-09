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