import { Model, DataTypes, Sequelize } from 'sequelize';

class Tag extends Model {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public version!: number;
  
  static initialize(sequelize: Sequelize) {
    Tag.init({
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
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'tag',
      tableName: 'tags',
      timestamps: true
    });
  }

  static associate(models: any) {
    if (!models.Template || !models.TemplateTag) {
      console.error('Missing required models for Tag associations');
      return;
    }
    
    Tag.belongsToMany(models.Template, {
      through: models.TemplateTag,
      foreignKey: 'tagId',
      otherKey: 'templateId'
    });
  }
}

export default Tag;