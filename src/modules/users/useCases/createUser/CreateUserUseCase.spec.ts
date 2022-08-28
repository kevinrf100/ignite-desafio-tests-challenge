import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create user tests" ,() => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {

    const user = await createUserUseCase.execute({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty("id");
    expect(user.email).toBe('kevin@testing.com');
    expect(user.name).toBe('kevin');

  })
});
