import { Model, DataTypes } from 'sequelize';

class Topic extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public version!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  /**
   * Initialize the Topic model with a sequelize instance
   * Works with both Sequelize and SequelizeTS instances
   */
  static initialize(sequelize: any) {
    const DataTypes = sequelize.Sequelize ? sequelize.Sequelize.DataTypes : require('sequelize').DataTypes;
    
    Topic.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      tableName: 'topics',
      timestamps: true,
      version: true
    });
  }
}

export default Topic;