import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from '@sequelize/core';

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  FUNCTION = 'function',
}

export class Conversation extends Model<InferAttributes<Conversation>, InferCreationAttributes<Conversation>> {
  @Attribute(DataTypes.STRING)
  declare tool_called: string | null;

  @Attribute(DataTypes.JSON)
  declare tool_arguments: unknown;

  @Attribute(DataTypes.JSON)
  declare tool_response: unknown;

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.ENUM(['assistant', 'user', 'function']))
  @NotNull
  declare role: Role;

  @Attribute(DataTypes.STRING)
  declare function_name: string | null;

  @Attribute(DataTypes.STRING)
  declare message: string | null;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare sessionToken: string;
}
