import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Template } from './Template';
import { Tag } from './Tag';

@Table({
  tableName: 'template_tags',
  timestamps: true
})
export class TemplateTag extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Template)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  templateId!: string;

  @ForeignKey(() => Tag)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  tagId!: number;
}