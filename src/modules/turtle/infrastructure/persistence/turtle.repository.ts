import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turtle, TurtleDocument } from '@/modules/turtle/domain/entities/turtle.schema';

type TurtleWritableFields = Pick<Turtle, 'name' | 'species' | 'age'>;

@Injectable()
export class TurtleRepository {
  constructor(
    @InjectModel(Turtle.name)
    private readonly turtleModel: Model<TurtleDocument>,
  ) {}

  create(payload: TurtleWritableFields) {
    return this.turtleModel.create(payload);
  }

  findAll() {
    return this.turtleModel.find().exec();
  }

  findById(id: string) {
    return this.turtleModel.findById(id).exec();
  }

  updateById(id: string, payload: Partial<TurtleWritableFields>) {
    return this.turtleModel.findByIdAndUpdate(id, payload, { new: true }).exec();
  }

  removeById(id: string) {
    return this.turtleModel.findByIdAndDelete(id).exec();
  }
}
