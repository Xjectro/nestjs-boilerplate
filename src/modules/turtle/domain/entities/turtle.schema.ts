import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true, id: false })
export class Turtle {
  _id!: string;

  @Prop({ type: String, unique: true, default: uuidv4 })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  species!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: 0 })
  age!: number;

  createdAt?: Date;

  updatedAt?: Date;
}

export type TurtleDocument = HydratedDocument<Turtle>;
export const TurtleSchema = SchemaFactory.createForClass(Turtle);
