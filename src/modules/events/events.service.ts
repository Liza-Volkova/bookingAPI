import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  async create(name: string, totalSeats: number): Promise<Event> {
    return this.eventRepository.save({ name, totalSeats });
  }
}
