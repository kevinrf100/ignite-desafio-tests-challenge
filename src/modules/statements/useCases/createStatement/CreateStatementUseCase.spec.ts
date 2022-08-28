import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;
describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
  });

  it("Should be able to create a new deposit",async () => {
    const user = await inMemoryUserRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    const statementData = {
      amount: 1000,
      description: "Just testing",
      user_id: user.id!,
      type: OperationType.DEPOSIT
    };

    const statement = await createStatementUseCase.execute(statementData);
    expect(statement).toBeInstanceOf(Statement);
    expect(statement.amount).toBe(statementData.amount);
    expect(statement.description).toBe(statementData.description);
    expect(statement.type).toBe(statementData.type);
    expect(statement.user_id).toBe(statementData.user_id);
  });

  it("Should not be able to create a new statement for a nonexistent user", async () => {
    expect(async ()=> {

      await createStatementUseCase.execute({
        amount: 10,
        description: "Just testing",
        user_id: "kevin",
        type: OperationType.DEPOSIT
      });

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it("Should be able to create a new withdraw",async () => {
    const user = await inMemoryUserRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });

    await createStatementUseCase.execute({
      amount: 1000,
      description: "Just testing",
      user_id: user.id!,
      type: OperationType.DEPOSIT
    });

    const statementData = {
      amount: 500,
      description: "Just testing",
      user_id: user.id!,
      type: OperationType.WITHDRAW
    };

    const statement = await createStatementUseCase.execute(statementData);
    expect(statement).toBeInstanceOf(Statement);
    expect(statement.amount).toBe(statementData.amount);
    expect(statement.description).toBe(statementData.description);
    expect(statement.type).toBe(statementData.type);
    expect(statement.user_id).toBe(statementData.user_id);
  });

  it("Should not be able to create a new withdraw more than your balance",async () => {
    expect(async ()=> {
      const user = await inMemoryUserRepository.create({
        email: "kevin@testing.com",
        password: "test",
        name: "kevin"
      });

      await createStatementUseCase.execute({
        amount: 10,
        description: "Just testing",
        user_id: user.id!,
        type: OperationType.DEPOSIT
      });

      const statementData = {
        amount: 500,
        description: "Just testing",
        user_id: user.id!,
        type: OperationType.WITHDRAW
      };

      const statement = await createStatementUseCase.execute(statementData);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
})
