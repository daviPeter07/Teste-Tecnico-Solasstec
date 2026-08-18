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
import { CreateHolidayDto } from './dto/create-holiday.dto';
import {
  HolidayListResponseDto,
  HolidayResponseDto,
} from './dto/holiday-response.dto';
import { ListHolidaysQueryDto } from './dto/list-holidays-query.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidaysService } from './holidays.service';

@ApiTags('Holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'List holidays' })
  @ApiOkResponse({ type: HolidayListResponseDto })
  list(@Query() query: ListHolidaysQueryDto): Promise<HolidayListResponseDto> {
    return this.holidaysService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a holiday by ID' })
  @ApiOkResponse({ type: HolidayResponseDto })
  @ApiErrorResponses(404)
  findById(@Param('id', ParseIntPipe) id: number): Promise<HolidayResponseDto> {
    return this.holidaysService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a holiday' })
  @ApiCreatedResponse({ type: HolidayResponseDto })
  @ApiErrorResponses(400, 409)
  create(@Body() input: CreateHolidayDto): Promise<HolidayResponseDto> {
    return this.holidaysService.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a holiday' })
  @ApiOkResponse({ type: HolidayResponseDto })
  @ApiErrorResponses(400, 404, 409)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateHolidayDto,
  ): Promise<HolidayResponseDto> {
    return this.holidaysService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a holiday' })
  @ApiNoContentResponse()
  @ApiErrorResponses(404)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.holidaysService.remove(id);
  }
}
