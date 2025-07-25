import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";


export class RegisterClientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}
