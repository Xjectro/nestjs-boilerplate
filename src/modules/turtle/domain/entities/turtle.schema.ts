import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Turtle {
  _id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  species!: string;

  @Prop({ default: 0 })
  age!: number;

  createdAt?: Date;

  updatedAt?: Date;
}

export type TurtleDocument = HydratedDocument<Turtle>;
export const TurtleSchema = SchemaFactory.createForClass(Turtle);
