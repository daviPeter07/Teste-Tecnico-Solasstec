import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponses } from '@/common/decorators/api-error-responses.decorator';
import {
  AppointmentListResponseDto,
  AppointmentResponseDto,
} from './dto/appointment-response.dto';
import { AppointmentSlotsResponseDto } from './dto/appointment-slot-response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentSlotsQueryDto } from './dto/list-appointment-slots-query.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AppointmentsService } from './appointments.service';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments' })
  @ApiOkResponse({ type: AppointmentListResponseDto })
  list(
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentListResponseDto> {
    return this.appointmentsService.list(query);
  }

  @Get('availability')
  @ApiOperation({ summary: 'List available appointment slots' })
  @ApiOkResponse({ type: AppointmentSlotsResponseDto })
  @ApiErrorResponses(400, 404)
  slots(
    @Query() query: ListAppointmentSlotsQueryDto,
  ): Promise<AppointmentSlotsResponseDto> {
    return this.appointmentsService.slots(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an appointment by ID' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  @ApiErrorResponses(404)
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register an appointment' })
  @ApiCreatedResponse({ type: AppointmentResponseDto })
  @ApiErrorResponses(400, 404, 422)
  create(@Body() input: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  @ApiErrorResponses(400, 404, 422)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, input);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  @ApiErrorResponses(404)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateStatus(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiNoContentResponse()
  @ApiErrorResponses(404)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appointmentsService.remove(id);
  }
}
