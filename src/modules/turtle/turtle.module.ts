import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Turtle, TurtleSchema } from '@/modules/turtle/schemas/turtle.schema';
import { TurtleController } from '@/modules/turtle/turtle.controller';
import { TurtleService } from '@/modules/turtle/turtle.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Turtle.name, schema: TurtleSchema }])],
  controllers: [TurtleController],
  providers: [TurtleService],
})
export class TurtleModule {}
