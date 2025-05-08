import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, BelongsToMany } from 'sequelize-typescript';
import User from './User';
import { Topic } from './Topic';
import { Tag } from './Tag';
import { TemplateTag } from './TemplateTag';

@Table({
  tableName: 'templates',
  timestamps: true,
  version: true 
})
export class Template extends Model {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  imageUrl!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Topic)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  topicId!: string;

  @BelongsTo(() => Topic)
  topic!: Topic;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isPublic!: boolean;

  @Default('[]')
  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  allowedUsers!: string; 

  @Default('{}')
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'JSON string containing scoring criteria for each question'
  })
  scoringCriteria!: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'Whether this template is a quiz with scoring'
  })
  isQuiz!: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'Whether to show scores immediately after submission'
  })
  showScoreImmediately!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customString1State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customString1Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customString2State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customString2Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customString3State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customString3Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customString4State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customString4Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customText1State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customText1Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customText2State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customText2Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customText3State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customText3Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customText4State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customText4Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customInt1State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customInt1Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customInt2State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customInt2Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customInt3State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customInt3Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customInt4State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customInt4Question!: string;

  // Checkbox question fields (up to 4)
  @Default(false)
  @Column(DataType.BOOLEAN)
  customCheckbox1State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customCheckbox1Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customCheckbox2State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customCheckbox2Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customCheckbox3State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customCheckbox3Question!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  customCheckbox4State!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  customCheckbox4Question!: string;

  @Default('[]')
  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  questionOrder!: string; 

  @BelongsToMany(() => Tag, () => TemplateTag)
  tags!: Tag[];

}