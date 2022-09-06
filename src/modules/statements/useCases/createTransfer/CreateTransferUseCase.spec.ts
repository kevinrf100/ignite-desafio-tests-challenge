import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let createTransferUseCase: CreateTransferUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;

describe("", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createTransferUseCase = new CreateTransferUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
  });

  it("Should be able to create a new transfer",async () => {
    const senderUser = await inMemoryUserRepository.create({
      email: "kevin@testing.com",
      password: "test",
      name: "kevin"
    });
    const user = await inMemoryUserRepository.create({
      email: "snoop@testing.com",
      password: "snoop",
      name: "kevin"
    });

    await inMemoryStatementsRepository.create({
      amount: 1000,
      description: "Just testing",
      user_id: senderUser.id!,
      type: OperationType.DEPOSIT
    });

    const statementData = {
      amount: 500,
      description: "Just testing",
      user_id: user.id!,
      type: OperationType.TRANSFER,
      sender_id: senderUser.id!
    };

    const statement = await createTransferUseCase.execute(statementData);
    expect(statement).toBeInstanceOf(Statement);
    expect(statement.amount).toBe(statementData.amount);
    expect(statement.description).toBe(statementData.description);
    expect(statement.type).toBe(statementData.type);
    expect(statement.user_id).toBe(statementData.user_id);
  });

  it("Should not be able to create a new transfer from a nonexistent user", async () => {
    const user = await inMemoryUserRepository.create({
      email: "teste@testing.com",
      password: "test",
      name: "teste"
    });

    await expect(createTransferUseCase.execute({
        amount: 10,
        description: "Just testing",
        user_id: user.id!,
        type: OperationType.DEPOSIT,
        sender_id: "testing"
      })).rejects.toEqual(new CreateTransferError.UserNotFound());
  });

  it("Should not be able to create a new transfer for a nonexistent user", async () => {
    const senderUser = await inMemoryUserRepository.create({
      email: "newteste@testing.com",
      password: "test",
      name: "newteste"
    });

    await expect(createTransferUseCase.execute({
        amount: 10,
        description: "Just testing",
        user_id: "kevin",
        type: OperationType.DEPOSIT,
        sender_id: senderUser.id!
      })).rejects.toEqual(new CreateTransferError.UserNotFound());
  });

  it("Should not be able to create a new transfer with insufficient amount", async () => {
    const senderUser = await inMemoryUserRepository.create({
      email: "balance@testing.com",
      password: "test",
      name: "balance"
    });

    const user = await inMemoryUserRepository.create({
      email: "onlyTesting@testing.com",
      password: "test",
      name: "onlyTesting"
    });

    await expect(createTransferUseCase.execute({
        amount: 10,
        description: "Just testing",
        user_id: user.id!,
        type: OperationType.DEPOSIT,
        sender_id: senderUser.id!
      })).rejects.toEqual(new CreateTransferError.InsufficientFunds());
  });
});
