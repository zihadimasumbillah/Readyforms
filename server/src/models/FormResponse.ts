import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './User';
import Template from './Template';

interface FormResponseAttributes {
  id?: string; 
  templateId: string;
  userId: string;
  customString1Answer?: string;
  customString2Answer?: string;
  customString3Answer?: string;
  customString4Answer?: string;
  customText1Answer?: string;
  customText2Answer?: string;
  customText3Answer?: string;
  customText4Answer?: string;
  customInt1Answer?: number;
  customInt2Answer?: number;
  customInt3Answer?: number;
  customInt4Answer?: number;
  customCheckbox1Answer?: boolean;
  customCheckbox2Answer?: boolean;
  customCheckbox3Answer?: boolean;
  customCheckbox4Answer?: boolean;
  score?: number;
  totalPossiblePoints?: number;
  scoreViewed?: boolean;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
  template?: any;
  user?: any;
}

class FormResponse extends Model<FormResponseAttributes> implements FormResponseAttributes {
  public id!: string;
  public templateId!: string;
  public userId!: string;
  public customString1Answer?: string;
  public customString2Answer?: string;
  public customString3Answer?: string;
  public customString4Answer?: string;
  public customText1Answer?: string;
  public customText2Answer?: string;
  public customText3Answer?: string;
  public customText4Answer?: string;
  public customInt1Answer?: number;
  public customInt2Answer?: number;
  public customInt3Answer?: number;
  public customInt4Answer?: number;
  public customCheckbox1Answer?: boolean;
  public customCheckbox2Answer?: boolean;
  public customCheckbox3Answer?: boolean;
  public customCheckbox4Answer?: boolean;
  public score?: number;
  public totalPossiblePoints?: number;
  public scoreViewed?: boolean;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  public template?: Template;
  public user?: User;

  static initialize(sequelize: Sequelize) {
    FormResponse.init({
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
      customString1Answer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString2Answer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString3Answer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customString4Answer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customText1Answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customText2Answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customText3Answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customText4Answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customInt1Answer: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customInt2Answer: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customInt3Answer: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customInt4Answer: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customCheckbox1Answer: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      customCheckbox2Answer: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      customCheckbox3Answer: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      customCheckbox4Answer: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      totalPossiblePoints: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      scoreViewed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'form_response',
      tableName: 'form_responses',
      timestamps: true
    });
  }

  static associate(models: any) {
    FormResponse.belongsTo(models.User, { foreignKey: 'userId' });
    FormResponse.belongsTo(models.Template, { foreignKey: 'templateId' });
  }
}

export default FormResponse;