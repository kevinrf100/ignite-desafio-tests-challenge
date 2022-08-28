import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { hash } from 'bcryptjs';
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;
describe('Authentication', () => {
  beforeEach(() => {
      inMemoryUserRepository = new InMemoryUsersRepository();
      authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
  })

  it('Should be able to authenticate', async () => {
    const password = await hash("123",8);

    const user = {
      email: "kevin@testing.com",
      password,
      name: "kevin"
    };

    console.log('JWT_SECRET');
    console.log(process.env.JWT_SECRET);

    const createdUser = await inMemoryUserRepository.create(user);

    const result = await authenticateUserUseCase.execute({email: user.email, password: '123'});

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe(user.email);
    expect(result.user.id).toBe(createdUser.id!);
    expect(result.user.name).toBe(user.name);
  });

  it('Should not be able to authenticate with wrong password', async () => {
    expect(async () => {
      const password = await hash("123",8);

      const user = {
        email: "kevin@testing.com",
        password,
        name: "kevin"
      };
      await inMemoryUserRepository.create(user);

      await authenticateUserUseCase.execute({email: user.email, password: '12333'});

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate with wrong email', async () => {
    expect(async () => {
      const password = await hash("123",8);

      const user = {
        email: "kevin@testing.com",
        password,
        name: "kevin"
      };

      await inMemoryUserRepository.create(user);

      await authenticateUserUseCase.execute({email: "user.email", password: user.password});

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
