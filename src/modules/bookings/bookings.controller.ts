import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { TopDto } from './dto/top.dto';

@ApiTags('Bookings')
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('reserve')
  reserve(@Body() dto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.createBooking(dto);
  }

  @Get()
  findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string): Promise<Booking[]> {
    return this.bookingsService.findByEventId(+eventId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Booking[]> {
    return this.bookingsService.findByUserId(userId);
  }

  @Get('top')
  getTop(): Promise<TopDto[]> {
    return this.bookingsService.getTop();
  }
}
