import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateTransportRouteDto } from './dto/create-transport-route.dto';
import { CreateTransportStopDto } from './dto/create-transport-stop.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('routes')
  @RequirePermissions(Permission.TRANSPORT_READ)
  async findAllRoutes() {
    return this.transportService.findAllRoutes();
  }

  @Get('routes/:id')
  @RequirePermissions(Permission.TRANSPORT_READ)
  async findRouteById(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.findRouteById(id);
  }

  @Post('routes')
  @RequirePermissions(Permission.TRANSPORT_MANAGE)
  async createRoute(@Body() dto: CreateTransportRouteDto) {
    return this.transportService.createRoute(dto);
  }

  @Post('stops')
  @RequirePermissions(Permission.TRANSPORT_MANAGE)
  async createStop(@Body() dto: CreateTransportStopDto) {
    return this.transportService.createStop(dto);
  }

  @Delete('routes/:id')
  @RequirePermissions(Permission.TRANSPORT_MANAGE)
  async removeRoute(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.removeRoute(id);
  }

  @Delete('stops/:id')
  @RequirePermissions(Permission.TRANSPORT_MANAGE)
  async removeStop(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.removeStop(id);
  }
}
