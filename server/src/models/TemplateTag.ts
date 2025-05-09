import { Model, DataTypes, Sequelize } from 'sequelize';

class TemplateTag extends Model {
  public templateId!: string;
  public tagId!: string;
  
  static initialize(sequelize: Sequelize) {
    TemplateTag.init({
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'templates',
          key: 'id'
        },
        primaryKey: true
      },
      tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
        primaryKey: true
      }
    }, {
      sequelize,
      modelName: 'template_tag',
      tableName: 'template_tags',
      timestamps: false
    });
  }

  static associate() {
  }
}

export default TemplateTag;