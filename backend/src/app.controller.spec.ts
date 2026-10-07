import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('should return "Hello World!"', async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const appController = app.get<AppController>(AppController);
    expect(appController.getHello()).toBe('Hello World!');
  });
});
