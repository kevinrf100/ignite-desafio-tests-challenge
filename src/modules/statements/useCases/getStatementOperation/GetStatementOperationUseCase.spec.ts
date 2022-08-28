import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository : InMemoryUsersRepository;
let inMemoryStatementsRepository : InMemoryStatementsRepository;
let getStatementOperationUseCase : GetStatementOperationUseCase;

describe("Get Statement operations", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('Should be able to get statement operations', async () => {
    const user = await inMemoryUsersRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 1000,
      description: "Just testing",
      user_id: user.id!,
      type: OperationType.DEPOSIT
    });

    const result = await getStatementOperationUseCase.execute({statement_id: statement.id!, user_id: user.id!});
    expect(result).toBeInstanceOf(Statement);
    expect(result).toHaveProperty("id");
    expect(result.id).toBe(statement.id);
    expect(result.amount).toBe(statement.amount);
    expect(result.description).toBe(statement.description);
    expect(result.type).toBe(statement.type);
    expect(result.user_id).toBe(statement.user_id);
  });

  it('Should not be able to get statement operations for a nonexistent user', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "kevin@testing.com",
        password: "test",
        name: "kevin"
      });
      const statement = await inMemoryStatementsRepository.create({
        amount: 1000,
        description: "Just testing",
        user_id: user.id!,
        type: OperationType.DEPOSIT
      });

      await getStatementOperationUseCase.execute({statement_id: statement.id!, user_id: 'kevin'});

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not be able to get statement operations for a nonexistent user', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "kevin@testing.com",
        password: "test",
        name: "kevin"
      });

      await inMemoryStatementsRepository.create({
        amount: 1000,
        description: "Just testing",
        user_id: "kevin",
        type: OperationType.DEPOSIT
      });

      await getStatementOperationUseCase.execute({statement_id: "test", user_id: user.id!});

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
