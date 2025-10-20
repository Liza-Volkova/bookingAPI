import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  event_id: number;

  @ApiProperty({ example: 'user123' })
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
