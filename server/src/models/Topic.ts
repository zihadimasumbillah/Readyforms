import { Model, DataTypes, Sequelize } from 'sequelize';

interface TopicAttributes {
  id?: string; // Make id optional for creation
  name: string;
  description?: string;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Topic extends Model<TopicAttributes> implements TopicAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Topic.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'topic',
      tableName: 'topics',
      timestamps: true
    });
  }

  static associate(models: any) {
    Topic.hasMany(models.Template, { foreignKey: 'topicId' });
  }
}

export default Topic;