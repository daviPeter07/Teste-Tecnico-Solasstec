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
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { ListVisitorsQueryDto } from './dto/list-visitors-query.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import {
  VisitorListResponseDto,
  VisitorResponseDto,
} from './dto/visitor-response.dto';
import { VisitorsService } from './visitors.service';

@ApiTags('Visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @ApiOperation({ summary: 'List visitors' })
  @ApiOkResponse({ type: VisitorListResponseDto })
  @ApiErrorResponses()
  list(@Query() query: ListVisitorsQueryDto): Promise<VisitorListResponseDto> {
    return this.visitorsService.list(query);
  }

  @Get('document/:document')
  @ApiOperation({ summary: 'Find a visitor by CPF' })
  @ApiOkResponse({ type: VisitorResponseDto })
  @ApiErrorResponses(404)
  findByDocument(
    @Param('document') document: string,
  ): Promise<VisitorResponseDto> {
    return this.visitorsService.findByDocument(document);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a visitor by ID' })
  @ApiOkResponse({ type: VisitorResponseDto })
  @ApiErrorResponses(404)
  findById(@Param('id', ParseIntPipe) id: number): Promise<VisitorResponseDto> {
    return this.visitorsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a visitor and calculate priority' })
  @ApiCreatedResponse({ type: VisitorResponseDto })
  @ApiErrorResponses(400, 409)
  create(@Body() input: CreateVisitorDto): Promise<VisitorResponseDto> {
    return this.visitorsService.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a visitor' })
  @ApiOkResponse({ type: VisitorResponseDto })
  @ApiErrorResponses(400, 404, 409)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateVisitorDto,
  ): Promise<VisitorResponseDto> {
    return this.visitorsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a visitor' })
  @ApiNoContentResponse()
  @ApiErrorResponses(404)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.visitorsService.remove(id);
  }
}
