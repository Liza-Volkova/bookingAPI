import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  findByEventAndUser(
    eventId: number,
    userId: string,
    manager?: EntityManager,
  ): Promise<Booking> {
    const repo = manager ? manager.getRepository(Booking) : this.repository;
    return repo.findOne({ where: { eventId, userId } });
  }

  countByEvent(eventId: number, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(Booking) : this.repository;
    return repo.count({ where: { eventId } });
  }

  findAllWithEvent(): Promise<Booking[]> {
    return this.repository.find({ relations: ['event'] });
  }

  findByEventWithDetails(eventId: number): Promise<Booking[]> {
    return this.repository.find({
      where: { eventId },
      relations: ['event'],
    });
  }

  findByUserWithDetails(userId: string): Promise<Booking[]> {
    return this.repository.find({
      where: { userId },
      relations: ['event'],
    });
  }
}
