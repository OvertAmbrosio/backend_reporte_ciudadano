import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create categories');
    }
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update categories');
    }
    return this.categoriesService.update(+id, updateCategoryDto);
  }
}
