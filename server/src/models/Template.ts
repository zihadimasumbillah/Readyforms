import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './User';
import Topic from './Topic';
import TemplateTag from './TemplateTag';

class Template extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public isPublic!: boolean;
  public userId!: string;
  public topicId!: string;
  public version!: number;
  public isQuiz?: boolean;
  public showScoreImmediately?: boolean;
  public scoringCriteria?: string;
  public allowedUsers?: string;

  public customString1State?: boolean;
  public customString1Question?: string;
  public customString2State?: boolean;
  public customString2Question?: string;
  public customString3State?: boolean;
  public customString3Question?: string;
  public customString4State?: boolean;
  public customString4Question?: string;
  
  public customText1State?: boolean;
  public customText1Question?: string;
  public customText2State?: boolean;
  public customText2Question?: string;
  public customText3State?: boolean;
  public customText3Question?: string;
  public customText4State?: boolean;
  public customText4Question?: string;
  
  public customInt1State?: boolean;
  public customInt1Question?: string;
  public customInt2State?: boolean;
  public customInt2Question?: string;
  public customInt3State?: boolean;
  public customInt3Question?: string;
  public customInt4State?: boolean;
  public customInt4Question?: string;
  
  public customCheckbox1State?: boolean;
  public customCheckbox1Question?: string;
  public customCheckbox2State?: boolean;
  public customCheckbox2Question?: string;
  public customCheckbox3State?: boolean;
  public customCheckbox3Question?: string;
  public customCheckbox4State?: boolean;
  public customCheckbox4Question?: string;
  
  public questionOrder?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public user?: User;
  public topic?: Topic;
  public tags?: any[];

  static initialize(sequelize: Sequelize) {
    Template.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id'
        }
      },
      isQuiz: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      showScoreImmediately: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      scoringCriteria: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      allowedUsers: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // String fields
      customString1State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customString1Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString2State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customString2Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString3State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customString3Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString4State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customString4Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Text fields
      customText1State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customText1Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customText2State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customText2Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customText3State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customText3Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customText4State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customText4Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Int fields
      customInt1State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customInt1Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customInt2State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customInt2Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customInt3State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customInt3Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customInt4State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customInt4Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Checkbox fields
      customCheckbox1State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customCheckbox1Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customCheckbox2State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customCheckbox2Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customCheckbox3State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customCheckbox3Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customCheckbox4State: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customCheckbox4Question: {
        type: DataTypes.STRING,
        allowNull: true
      },
      questionOrder: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'template',
      tableName: 'templates',
      timestamps: true
    });
  }

  static associate(models: any) {
    if (!models.User || !models.Topic || !models.Tag || !models.TemplateTag) {
      console.error('Missing required models for Template associations');
      return;
    }
    
    Template.belongsTo(models.User, { foreignKey: 'userId' });
    Template.belongsTo(models.Topic, { foreignKey: 'topicId' });
 
    if (models.Tag && models.TemplateTag) {
      Template.belongsToMany(models.Tag, {
        through: models.TemplateTag,
        foreignKey: 'templateId',
        otherKey: 'tagId'
      });
    }
    
    Template.hasMany(models.FormResponse, { foreignKey: 'templateId' });
    Template.hasMany(models.Comment, { foreignKey: 'templateId' });
    Template.hasMany(models.Like, { foreignKey: 'templateId' });
  }
}

export default Template;