import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportRouteEntity } from './entities/transport-route.entity';
import { TransportStopEntity } from './entities/transport-stop.entity';
import { CreateTransportRouteDto } from './dto/create-transport-route.dto';
import { CreateTransportStopDto } from './dto/create-transport-stop.dto';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(TransportRouteEntity)
    private readonly routeRepository: Repository<TransportRouteEntity>,
    @InjectRepository(TransportStopEntity)
    private readonly stopRepository: Repository<TransportStopEntity>,
  ) {}

  async findAllRoutes(): Promise<TransportRouteEntity[]> {
    return this.routeRepository.find({
      relations: { stops: true },
      order: { routeName: 'ASC' },
    });
  }

  async findRouteById(id: number): Promise<TransportRouteEntity> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: { stops: true },
    });
    if (!route) {
      throw new NotFoundException(`Transport route with ID ${id} not found`);
    }
    return route;
  }

  async createRoute(dto: CreateTransportRouteDto): Promise<TransportRouteEntity> {
    const newRoute = this.routeRepository.create(dto);
    return this.routeRepository.save(newRoute);
  }

  async createStop(dto: CreateTransportStopDto): Promise<TransportStopEntity> {
    const route = await this.findRouteById(dto.routeId);
    const newStop = this.stopRepository.create({
      ...dto,
      route,
    });
    return this.stopRepository.save(newStop);
  }

  async removeRoute(id: number): Promise<{ success: boolean; message: string }> {
    const route = await this.findRouteById(id);
    await this.routeRepository.remove(route);
    return { success: true, message: `Transport route ID ${id} deleted` };
  }

  async removeStop(id: number): Promise<{ success: boolean; message: string }> {
    const stop = await this.stopRepository.findOne({ where: { id } });
    if (!stop) {
      throw new NotFoundException(`Transport stop ID ${id} not found`);
    }
    await this.stopRepository.remove(stop);
    return { success: true, message: `Transport stop ID ${id} deleted` };
  }
}
