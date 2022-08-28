
import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create a statement", () => {
  beforeAll(async () => {
      connection = await createConnection();

      await connection.runMigrations();

      const password = await hash("admin", 8);
      const id = uuidV4();

      await connection.query(
        `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'admin', 'admin@test.com.br', '${password}', 'now()', 'now()')`
      );
  });

  afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
  });

  it("Should be able to deposit", async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }
    const statement = {
      amount: 100,
      description: "Testing"
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).post('/api/v1/statements/deposit').set({ Authorization: `Bearer ${token}` }).send(statement);

    expect(response.status).toBe(201);
  });

  it("Should be able to withdraw", async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }
    const statement = {
      amount: 100,
      description: "Testing"
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).post('/api/v1/statements/withdraw').set({ Authorization: `Bearer ${token}` }).send(statement);

    expect(response.status).toBe(201);
  });

  it("Should not be able execute a withdraw if not have the value", async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }
    const statement = {
      amount: 1000,
      description: "Testing"
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).post('/api/v1/statements/withdraw').set({ Authorization: `Bearer ${token}` }).send(statement);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message')
  });

  it("Should not be able execute a deposit for a nonexistent user", async () => {

    const statement = {
      amount: 1000,
      description: "Testing"
    }

    const response = await request(app).post('/api/v1/statements/deposit').set({ Authorization: `Bearer teste` }).send(statement);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it("Should not be able execute a withdraw for a nonexistent user", async () => {

    const statement = {
      amount: 1000,
      description: "Testing"
    }

    const response = await request(app).post('/api/v1/statements/withdraw').set({ Authorization: `Bearer teste` }).send(statement);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

});
