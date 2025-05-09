import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './User';
import Template from './Template';

class Like extends Model {
  static initialize(sequelize: Sequelize) {
    Like.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        templateId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'likes',
        timestamps: true,
        version: true,
        indexes: [
          {
            unique: true,
            fields: ['userId', 'templateId'],
          },
        ],
      }
    );
  }

  static associate(models: any) {
    Like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Like.belongsTo(models.Template, { foreignKey: 'templateId', as: 'template' });
  }
}

export default Like;