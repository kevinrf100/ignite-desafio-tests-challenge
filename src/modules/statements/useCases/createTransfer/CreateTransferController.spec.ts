import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Console } from "console";

let connection: Connection;
let userID: string;


describe("Should be able to create a transfer", () => {
  beforeAll(async ()=> {
    connection = await createConnection();

    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuidV4();
    userID = uuidV4();

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@test.com.br', '${password}', 'now()', 'now()')`
    );

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${userID}', 'receiver', 're@test.com.br', '${password}', 'now()', 'now()')`
    );

    const statementId = uuidV4()
    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at, sender_id)
      values('${statementId}', '${id}', 'Initial deposit', 200, 'deposit', 'now()', 'now()', NULL)`
    );
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to transfer", async () => {
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

    const response = await request(app).post(`/api/v1/statements/transfer/${userID}`).set({ Authorization: `Bearer ${token}` }).send(statement);

    expect(response.status).toBe(201);
  });
})
