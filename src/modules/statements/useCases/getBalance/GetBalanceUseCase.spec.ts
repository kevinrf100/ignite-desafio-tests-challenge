import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it("Should be able to get the balance", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    const result = await getBalanceUseCase.execute({user_id: user.id!});

    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement");
    expect(result.balance).toBe(0);
  });

  it("Should not be able to get the balance from a nonexistent user", async () => {
    expect(async () => {
      const result = await getBalanceUseCase.execute({user_id: "kevin"});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
