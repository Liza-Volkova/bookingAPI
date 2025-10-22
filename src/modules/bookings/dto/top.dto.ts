import { ApiProperty } from "@nestjs/swagger";

export class TopDto {
    @ApiProperty({ example: 'user123' })
    user_id: string;
  
    @ApiProperty({ example: 1 })
    place: number;
  
    @ApiProperty({ example: 5 })
    booking_count: number;
  }