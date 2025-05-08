import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Template } from './Template';
import { TemplateTag } from './TemplateTag';

@Table({
  tableName: 'tags',
  timestamps: true
})
export class Tag extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name!: string;

  @BelongsToMany(() => Template, () => TemplateTag)
  templates!: Template[];
}