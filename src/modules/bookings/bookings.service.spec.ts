import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Event } from '../events/entities/event.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsRepository } from './bookings.repository';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockEvent: Event = {
    id: 1,
    name: 'Test Event',
    totalSeats: 100,
  };

  const mockBooking: Booking = {
    id: 1,
    eventId: 1,
    userId: 'user123',
    createdAt: new Date(),
    event: mockEvent,
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRepository = {
    findByEventAndUser: jest.fn(),
    countByEvent: jest.fn(),
    findAllWithEvent: jest.fn(),
    findByEventWithDetails: jest.fn(),
    findByUserWithDetails: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((callback) => callback(mockEntityManager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: BookingsRepository,
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('createBooking', () => {
    const createBookingDto: CreateBookingDto = {
      event_id: 1,
      user_id: 'user123',
    };

    it('should successfully create a booking', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockEvent);
      mockRepository.findByEventAndUser.mockResolvedValue(null);
      mockRepository.countByEvent.mockResolvedValue(50);
      mockEntityManager.save.mockResolvedValue(mockBooking);

      const result = await service.createBooking(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(mockRepository.findByEventAndUser).toHaveBeenCalledWith(
        1,
        'user123',
        expect.any(Object),
      );
      expect(mockRepository.countByEvent).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if user already booked the event', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockEvent);
      mockRepository.findByEventAndUser.mockResolvedValue(mockBooking);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        'You have already booked this event',
      );
    });

    it('should throw ConflictException if no seats available', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockEvent);
      mockRepository.findByEventAndUser.mockResolvedValue(null);
      mockRepository.countByEvent.mockResolvedValue(100);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        'No seats available for this event',
      );
    });
  });
});
