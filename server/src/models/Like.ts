import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, Index } from 'sequelize-typescript';
import User from './User';
import { Template } from './Template';

@Table({
  tableName: 'likes',
  timestamps: true,
  version: true, // Enable optimistic locking
  indexes: [
    {
      unique: true,
      fields: ['userId', 'templateId']
    }
  ]
})
export class Like extends Model {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Template)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  templateId!: string;

  @BelongsTo(() => Template)
  template!: Template;
}