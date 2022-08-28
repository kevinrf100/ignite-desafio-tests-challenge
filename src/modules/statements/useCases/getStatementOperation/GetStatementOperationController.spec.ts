import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
const statement_id = uuidV4();

describe("Get Statement operations", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const password = await hash("admin", 8);
    const user_id = uuidV4();

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${user_id}', 'admin', 'admin@test.com.br', '${password}', 'now()', 'now()')`
    );


    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, created_at, updated_at, type)
      values('${statement_id}', '${user_id}', 'Testing', '500', 'now()', 'now()', 'deposit')`
    );
  });

  afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
  });

  it('Should be able to get statement operations', async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(200);
  });

  it('Should not be able to get statement operations for a nonexistent user', async () => {
    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({ Authorization: `Bearer 1233` });

    expect(response.status).toBe(401);
  });

  it('Should not be able to get a nonexistent statement operations', async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }

    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).get(`/api/v1/statements/0bf7933e-1ee2-428d-849c-ed31f88487e0`).set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });

})
