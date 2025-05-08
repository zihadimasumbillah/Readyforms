import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'topics',
  timestamps: true,
  version: true 
})
export class Topic extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;
}