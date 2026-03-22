import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTurtleDto } from '@/modules/turtle/dto/create-turtle.dto';
import { UpdateTurtleDto } from '@/modules/turtle/dto/update-turtle.dto';
import { Turtle, TurtleDocument } from '@/modules/turtle/schemas/turtle.schema';

@Injectable()
export class TurtleService {
  constructor(
    @InjectModel(Turtle.name)
    private readonly turtleModel: Model<TurtleDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createTurtleDto: CreateTurtleDto) {
    await this.cacheManager.del('turtles');
    return this.turtleModel.create(createTurtleDto);
  }

  async findAll() {
    const cachedTurtles = await this.cacheManager.get<Turtle[]>('turtles');
    if (cachedTurtles) {
      return cachedTurtles;
    }
    const currentTurtles = await this.turtleModel.find().exec();
    if (currentTurtles.length === 0) {
      return [];
    }
    await this.cacheManager.set('turtles', currentTurtles);
    return currentTurtles;
  }

  async findOne(id: string) {
    const cachedTurtle = await this.cacheManager.get<Turtle>(`turtles_${id}`);
    if (cachedTurtle) {
      return cachedTurtle;
    }
    const currentTurtle = await this.turtleModel.findById(id).exec();
    if (!currentTurtle) {
      return null;
    }
    await this.cacheManager.set(`turtles_${id}`, currentTurtle);
    return currentTurtle;
  }

  async update(id: string, updateTurtleDto: UpdateTurtleDto) {
    const updatedTurtle = await this.turtleModel
      .findByIdAndUpdate(id, updateTurtleDto, { new: true })
      .exec();
    if (updatedTurtle) {
      await this.cacheManager.set(`turtles_${id}`, updatedTurtle);
      await this.cacheManager.del('turtles');
    }
    return updatedTurtle;
  }

  async remove(id: string) {
    await this.cacheManager.del(`turtles_${id}`);
    await this.cacheManager.del('turtles');
    return this.turtleModel.findByIdAndDelete(id).exec();
  }
}
