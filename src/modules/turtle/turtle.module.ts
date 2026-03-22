import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurtleService } from '@/modules/turtle/application/turtle.service';
import { Turtle, TurtleSchema } from '@/modules/turtle/domain/entities/turtle.schema';
import { TurtleCacheRepository } from '@/modules/turtle/infrastructure/persistence/turtle.cache.repository';
import { TurtleRepository } from '@/modules/turtle/infrastructure/persistence/turtle.repository';
import { TurtleController } from '@/modules/turtle/presentation/http/turtle.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Turtle.name, schema: TurtleSchema }])],
  controllers: [TurtleController],
  providers: [TurtleService, TurtleRepository, TurtleCacheRepository],
})
export class TurtleModule {}
