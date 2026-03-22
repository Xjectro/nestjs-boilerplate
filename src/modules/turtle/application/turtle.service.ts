import { Injectable } from '@nestjs/common';
import { CreateTurtleDto } from '@/modules/turtle/application/dto/create-turtle.dto';
import { UpdateTurtleDto } from '@/modules/turtle/application/dto/update-turtle.dto';
import { TurtleCacheRepository } from '@/modules/turtle/infrastructure/persistence/turtle.cache.repository';
import { TurtleRepository } from '@/modules/turtle/infrastructure/persistence/turtle.repository';

@Injectable()
export class TurtleService {
  constructor(
    private readonly turtleRepository: TurtleRepository,
    private readonly turtleCache: TurtleCacheRepository,
  ) {}

  async create(createTurtleDto: CreateTurtleDto) {
    const created = await this.turtleRepository.create(createTurtleDto);
    await this.turtleCache.evictList();
    const cacheId = this.resolveCacheId(created);
    await this.turtleCache.setOne(cacheId, created);
    return created;
  }

  async findAll() {
    const cachedTurtles = await this.turtleCache.getList();
    if (cachedTurtles) {
      return cachedTurtles;
    }
    const currentTurtles = await this.turtleRepository.findAll();
    if (currentTurtles.length === 0) {
      return [];
    }
    await this.turtleCache.setList(currentTurtles);
    return currentTurtles;
  }

  async findOne(id: string) {
    const cachedTurtle = await this.turtleCache.getOne(id);
    if (cachedTurtle) {
      return cachedTurtle;
    }
    const currentTurtle = await this.turtleRepository.findById(id);
    if (!currentTurtle) {
      return null;
    }
    await this.turtleCache.setOne(id, currentTurtle);
    return currentTurtle;
  }

  async update(id: string, updateTurtleDto: UpdateTurtleDto) {
    const updatedTurtle = await this.turtleRepository.updateById(id, updateTurtleDto);
    if (updatedTurtle) {
      const cacheId = this.resolveCacheId(updatedTurtle, id);
      await this.turtleCache.setOne(cacheId, updatedTurtle);
      await this.turtleCache.evictList();
    }
    return updatedTurtle;
  }

  async remove(id: string) {
    await this.turtleCache.evictOne(id);
    await this.turtleCache.evictList();
    return this.turtleRepository.removeById(id);
  }

  private resolveCacheId(entity: { _id?: unknown; id?: string }, fallback?: string) {
    if (entity.id) {
      return entity.id;
    }

    const rawId = entity._id;
    if (typeof rawId === 'string') {
      return rawId;
    }

    if (rawId && typeof (rawId as { toString?: () => string }).toString === 'function') {
      return (rawId as { toString: () => string }).toString();
    }

    return fallback ?? '';
  }
}
