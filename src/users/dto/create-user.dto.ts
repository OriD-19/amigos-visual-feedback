import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

@Controller()
export class CreateUserDto {
  email: string;
  name: string;
  password: string;
}
