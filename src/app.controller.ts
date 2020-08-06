import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MovieDto } from './neo4j/dto/movie.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/total-nodes')
  async getTotalNodes(): Promise<string> {
    return await this.appService.getTotalNodes();
  }

  @Post('/movie')
  async postMovie(@Body() movieDto: MovieDto): Promise<any> {
    return await this.appService.createMovie(movieDto);
  }
}
