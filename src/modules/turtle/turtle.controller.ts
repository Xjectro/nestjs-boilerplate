import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTurtleDto } from '@/modules/turtle/dto/create-turtle.dto';
import { UpdateTurtleDto } from '@/modules/turtle/dto/update-turtle.dto';
import { TurtleService } from '@/modules/turtle/turtle.service';
import { IdempotencyInterceptor } from '@/shared/interceptors/idempotency.interceptor';

@ApiTags('turtles')
@Controller('turtle')
export class TurtleController {
  constructor(private readonly turtleService: TurtleService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Create a new turtle' })
  @ApiBody({ type: CreateTurtleDto })
  @ApiResponse({ status: 201, description: 'Turtle created successfully.' })
  createTurtle(@Body() dto: CreateTurtleDto) {
    return this.turtleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all turtles' })
  @ApiResponse({ status: 200, description: 'Fetched turtles successfully.' })
  findAll() {
    return this.turtleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get turtle by id' })
  @ApiParam({ name: 'id', description: 'Mongo object id' })
  @ApiResponse({ status: 200, description: 'Turtle retrieved successfully.' })
  findOne(@Param('id') id: string) {
    return this.turtleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update turtle by id' })
  @ApiParam({ name: 'id', description: 'Mongo object id' })
  @ApiBody({ type: UpdateTurtleDto })
  @ApiResponse({ status: 200, description: 'Turtle updated successfully.' })
  updateTurtle(@Param('id') id: string, @Body() dto: UpdateTurtleDto) {
    return this.turtleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete turtle by id' })
  @ApiParam({ name: 'id', description: 'Mongo object id' })
  @ApiResponse({ status: 200, description: 'Turtle deleted successfully.' })
  async removeTurtle(@Param('id') id: string) {
    const removed = await this.turtleService.remove(id);
    return Boolean(removed);
  }
}
