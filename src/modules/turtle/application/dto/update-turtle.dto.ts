import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateTurtleDto } from '@/modules/turtle/application/dto/create-turtle.dto';

export class UpdateTurtleDto extends PartialType(CreateTurtleDto) {
  @ApiProperty({ example: '9f2d6c3b-1f1c-4e4c-8a3b-2e6f6a9c1b5d' })
  @IsUUID()
  id!: string;
}
