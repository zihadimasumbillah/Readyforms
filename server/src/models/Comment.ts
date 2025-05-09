import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './User';
import Template from './Template';

interface CommentAttributes {
  id?: string; 
  templateId: string;
  userId: string;
  content: string;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
  template?: any;
  user?: any;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: string;
  public templateId!: string;
  public userId!: string;
  public content!: string;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  public template?: Template;
  public user?: User;

  static initialize(sequelize: Sequelize) {
    Comment.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'templates',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'comment',
      tableName: 'comments',
      timestamps: true
    });
  }

  static associate(models: any) {
    Comment.belongsTo(models.User, { foreignKey: 'userId' });
    Comment.belongsTo(models.Template, { foreignKey: 'templateId' });
  }
}

export default Comment;