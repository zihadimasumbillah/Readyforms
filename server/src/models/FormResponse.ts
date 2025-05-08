import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import User from './User';
import { Template } from './Template';

@Table({
  tableName: 'form_responses',
  timestamps: true,
  version: true 
})
export class FormResponse extends Model {
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
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'The score achieved for this response'
  })
  score!: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'The total possible points for this template'
  })
  totalPossiblePoints!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the user has viewed their score'
  })
  scoreViewed!: boolean;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  customString1Answer!: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  customString2Answer!: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  customString3Answer!: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  customString4Answer!: string;

  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  customText1Answer!: string;

  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  customText2Answer!: string;

  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  customText3Answer!: string;

  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  customText4Answer!: string;
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: true 
  })
  customInt1Answer!: number;

  @Column({ 
    type: DataType.INTEGER, 
    allowNull: true 
  })
  customInt2Answer!: number;

  @Column({ 
    type: DataType.INTEGER, 
    allowNull: true 
  })
  customInt3Answer!: number;

  @Column({ 
    type: DataType.INTEGER, 
    allowNull: true 
  })
  customInt4Answer!: number;

  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: true 
  })
  customCheckbox1Answer!: boolean;

  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: true 
  })
  customCheckbox2Answer!: boolean;

  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: true 
  })
  customCheckbox3Answer!: boolean;

  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: true 
  })
  customCheckbox4Answer!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isEmailCopySent!: boolean;
}