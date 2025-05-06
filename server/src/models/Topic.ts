import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'topics',
  timestamps: true,
  version: true // Enable optimistic locking
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

  // We don't use HasMany directly to avoid circular dependencies
  // templates will be defined in the Template model
}