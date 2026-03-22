import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { CreateTurtleDto } from '@/modules/turtle/dto/create-turtle.dto';

export class UpdateTurtleDto extends PartialType(CreateTurtleDto) {
  @ApiProperty({ example: '65fb2bd5f0f86eddc2a3f8b1' })
  @IsMongoId()
  id: string;

  constructor() {
    super();
    this.id = '';
  }
}
