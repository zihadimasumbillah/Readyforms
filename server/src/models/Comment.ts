import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import User from './User';
import { Template } from './Template';

@Table({
  tableName: 'comments',
  timestamps: true,
  version: true 
})
export class Comment extends Model {
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

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;
}