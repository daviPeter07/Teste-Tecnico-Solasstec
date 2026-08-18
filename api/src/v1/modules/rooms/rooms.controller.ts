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
import { CreateRoomDto } from './dto/create-room.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import {
  RoomHistoryResponseDto,
  RoomListResponseDto,
  RoomResponseDto,
} from './dto/room-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms' })
  @ApiOkResponse({ type: RoomListResponseDto })
  list(@Query() query: ListRoomsQueryDto): Promise<RoomListResponseDto> {
    return this.roomsService.list(query);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get responsible and availability history' })
  @ApiOkResponse({ type: RoomHistoryResponseDto })
  @ApiErrorResponses(404)
  history(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoomHistoryResponseDto> {
    return this.roomsService.history(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a room by ID' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiErrorResponses(404)
  findById(@Param('id', ParseIntPipe) id: number): Promise<RoomResponseDto> {
    return this.roomsService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Register a room with responsible and opening hours',
  })
  @ApiCreatedResponse({ type: RoomResponseDto })
  @ApiErrorResponses(400)
  create(@Body() input: CreateRoomDto): Promise<RoomResponseDto> {
    return this.roomsService.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiErrorResponses(400, 404)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiNoContentResponse()
  @ApiErrorResponses(404)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roomsService.remove(id);
  }
}
