import { Table, Column, Model, DataType, Default, Unique, IsEmail, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'users',
  timestamps: true
})
class User extends Model {
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
  name!: string;

  @Unique
  @IsEmail
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isAdmin!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  blocked!: boolean;

  @Column(DataType.STRING)
  language?: string;

  @Column(DataType.STRING)
  theme?: string;

  @Column(DataType.DATE)
  lastLoginAt?: Date;
  async validatePassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }
  @BeforeCreate
  static async hashPasswordBeforeCreate(instance: User) {
    if (instance.password) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }

  @BeforeUpdate
  static async hashPasswordBeforeUpdate(instance: User) {
    if (instance.changed('password')) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }
}

export default User;