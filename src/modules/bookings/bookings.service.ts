import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Event } from '../events/entities/event.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsRepository } from './bookings.repository';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const event = await manager.findOne(Event, {
        where: { id: dto.event_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.event_id} not found`);
      }

      const existingBooking = await this.bookingsRepository.findByEventAndUser(
        dto.event_id,
        dto.user_id,
        manager,
      );

      if (existingBooking) {
        throw new ConflictException('You have already booked this event');
      }

      const bookingsCount = await this.bookingsRepository.countByEvent(
        dto.event_id,
        manager,
      );

      if (bookingsCount >= event.totalSeats) {
        throw new ConflictException('No seats available for this event');
      }

      return manager.save(Booking, {
        eventId: dto.event_id,
        userId: dto.user_id,
      });
    });
  }

  findAll(): Promise<Booking[]> {
    return this.bookingsRepository.findAllWithEvent();
  }

  findByEventId(eventId: number): Promise<Booking[]> {
    return this.bookingsRepository.findByEventWithDetails(eventId);
  }

  findByUserId(userId: string): Promise<Booking[]> {
    return this.bookingsRepository.findByUserWithDetails(userId);
  }
}
