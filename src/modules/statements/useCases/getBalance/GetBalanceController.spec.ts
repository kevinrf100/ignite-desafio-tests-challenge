import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Balance", () => {
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

  it("Should be able to get balance", async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).get('/api/v1/statements/balance').set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(0);
  });

  it("Should not be able to get balance from a nonexistent user", async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({ Authorization: `Bearer 12312` });

    expect(response.status).toBe(401);
  });

});
