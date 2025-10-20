import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './modules/events/events.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { Event } from './modules/events/entities/event.entity';
import { Booking } from './modules/bookings/entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', '127.0.0.1'),
        port: configService.get('DB_PORT', 5433),
        username: configService.get('DB_USER', 'booking_user'),
        password: configService.get('DB_PASSWORD', 'booking_password'),
        database: configService.get('DB_NAME', 'booking_db'),
        entities: [Event, Booking],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    EventsModule,
    BookingsModule,
  ],
})
export class AppModule {}
