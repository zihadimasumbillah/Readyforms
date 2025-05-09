import { Model, DataTypes, Sequelize } from 'sequelize';
import Template from './Template';

interface UserAttributes {
  id?: string; // Make id optional for creation
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  blocked?: boolean; // Make blocked optional with default value
  language: string;
  theme: string;
  lastLoginAt?: Date;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public isAdmin!: boolean;
  public blocked!: boolean;
  public language!: string;
  public theme!: string;
  public lastLoginAt!: Date;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  static initialize(sequelize: Sequelize) {
    User.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'en'
      },
      theme: {
        type: DataTypes.STRING,
        defaultValue: 'light'
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'user',
      tableName: 'users',
      timestamps: true
    });
  }

  static associate(models: any) {
    User.hasMany(models.Template, { foreignKey: 'userId' });
    User.hasMany(models.FormResponse, { foreignKey: 'userId' });
    User.hasMany(models.Comment, { foreignKey: 'userId' });
    User.hasMany(models.Like, { foreignKey: 'userId' });
  }
}

export default User;