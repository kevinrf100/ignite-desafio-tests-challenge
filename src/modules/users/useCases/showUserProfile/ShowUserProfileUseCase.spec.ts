import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;

describe("Show user profile" ,() => {
  beforeEach(()=> {
    inMemoryUserRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository);
  })

  it("Should be able to show user profile", async () => {
    const createdUser = await inMemoryUserRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    const user = await showUserProfileUseCase.execute(createdUser.id!);

    expect(user).toBeInstanceOf(User);
    expect(user).toBe(createdUser);
  });

  it("Should not be able to show user profile for a nonexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("12333333");
    }).rejects.toBeInstanceOf(ShowUserProfileError);

  });
});
