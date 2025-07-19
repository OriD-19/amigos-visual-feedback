import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      email: "juan@example.com",
      name: "Juan Pérez",
      password: "hashedpassword123",
    },
    {
      id: 2,
      email: "maria@example.com",
      name: "María López",
      password: "securepass456",
    },
  ];

  private nextId = 3;

  findOneByEmail(email: string) {
    return this.users.find(user => user.email === email);
  }

  create(createUserDto: CreateUserDto) {
    const newUser = {
      id: this.nextId++,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }
}
