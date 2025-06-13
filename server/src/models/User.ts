import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare isAdmin: boolean;
  declare blocked: boolean;
  declare language: string;
  declare theme: string;
  declare lastLoginAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare version: number;

  /**
   * Initialize the User model with a sequelize instance
   * Works with both Sequelize and SequelizeTS instances
   */
  static initialize(sequelize: any) {
    try {
      console.log('Initializing User model');
      
      // Get DataTypes from sequelize or require it directly
      const DataTypes = sequelize.Sequelize ? sequelize.Sequelize.DataTypes : require('sequelize').DataTypes;
      
      // Initialize the model with sequelize
      User.init({
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isAdmin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        blocked: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        language: {
          type: DataTypes.STRING,
          defaultValue: 'en',
        },
        theme: {
          type: DataTypes.STRING,
          defaultValue: 'light',
        },
        lastLoginAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        version: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        }
      }, {
        sequelize,
        tableName: 'users',
        timestamps: true,
      });
      
      // DON'T assign to the read-only sequelize property
      // Instead, use static properties defined on the model
      // The sequelize property will be available on the model via the init() call
    } catch (error) {
      console.error('Error initializing User model:', error);
      throw error;
    }
  }

  /**
   * Compare password with hashed password stored in database
   * @param candidatePassword The plain password to compare
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export default User;