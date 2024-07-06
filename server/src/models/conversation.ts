import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from '@sequelize/core';

enum Role {
  ASSISTANT = 'ASSISTANT',
  USER = 'USER',
}

export class Conversation extends Model<InferAttributes<Conversation>, InferCreationAttributes<Conversation>> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.ENUM)
  @NotNull
  declare role: Role;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare message: string;
}