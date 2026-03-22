import { CreateTurtleDto } from '@/modules/turtle/dto/create-turtle.dto';
import { UpdateTurtleDto } from '@/modules/turtle/dto/update-turtle.dto';
import { Turtle } from '@/modules/turtle/schemas/turtle.schema';
import { TurtleService } from '@/modules/turtle/turtle.service';

const execResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('TurtleService', () => {
  let service: TurtleService;
  let turtleModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };
  let cacheManager: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  beforeEach(() => {
    turtleModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new TurtleService(turtleModel as any, cacheManager as any);
  });

  describe('create', () => {
    it('persists the turtle and busts cached list', async () => {
      const dto = { name: 'Splinter' } as CreateTurtleDto;
      const created = { _id: '1', name: 'Splinter' } as Turtle;
      turtleModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(cacheManager.del).toHaveBeenCalledWith('turtles');
      expect(turtleModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('returns cached turtles when available', async () => {
      const cached = [{ _id: '1' }] as Turtle[];
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.findAll();

      expect(result).toEqual(cached);
      expect(turtleModel.find).not.toHaveBeenCalled();
    });

    it('queries database and caches response when cache is empty', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const turtles = [{ _id: '2' }] as Turtle[];
      const query = execResult(turtles);
      turtleModel.find.mockReturnValue(query);

      const result = await service.findAll();

      expect(query.exec).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('turtles', turtles);
      expect(result).toEqual(turtles);
    });

    it('returns empty list without caching when database has no turtles', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const query = execResult([]);
      turtleModel.find.mockReturnValue(query);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns cached turtle by id when present', async () => {
      const cached = { _id: '1' } as Turtle;
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.findOne('1');

      expect(result).toEqual(cached);
      expect(turtleModel.findById).not.toHaveBeenCalled();
    });

    it('fetches turtle, caches it, and returns when not cached', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const turtle = { _id: '3' } as Turtle;
      const query = execResult(turtle);
      turtleModel.findById.mockReturnValue(query);

      const result = await service.findOne('3');

      expect(query.exec).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('turtles_3', turtle);
      expect(result).toEqual(turtle);
    });

    it('returns null when turtle does not exist', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const query = execResult(null);
      turtleModel.findById.mockReturnValue(query);

      const result = await service.findOne('missing');

      expect(result).toBeNull();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates turtle, refreshes caches, and returns entity', async () => {
      const dto = { name: 'Leo' } as UpdateTurtleDto;
      const updated = { _id: '5', name: 'Leo' } as Turtle;
      const query = execResult(updated);
      turtleModel.findByIdAndUpdate.mockReturnValue(query);

      const result = await service.update('5', dto);

      expect(query.exec).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('turtles_5', updated);
      expect(cacheManager.del).toHaveBeenCalledWith('turtles');
      expect(result).toEqual(updated);
    });

    it('returns null without touching cache when update fails', async () => {
      const dto = { name: 'Donnie' } as UpdateTurtleDto;
      const query = execResult(null);
      turtleModel.findByIdAndUpdate.mockReturnValue(query);

      const result = await service.update('6', dto);

      expect(result).toBeNull();
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(cacheManager.del).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('clears caches and deletes turtle', async () => {
      const deletionResult = { acknowledged: true };
      const query = execResult(deletionResult);
      turtleModel.findByIdAndDelete.mockReturnValue(query);

      const result = await service.remove('7');

      expect(cacheManager.del).toHaveBeenNthCalledWith(1, 'turtles_7');
      expect(cacheManager.del).toHaveBeenNthCalledWith(2, 'turtles');
      expect(query.exec).toHaveBeenCalled();
      expect(result).toEqual(deletionResult);
    });
  });
});
