import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const password = await hash("admin", 8);
    const id = uuidV4();

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'ad@test.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
  });

  it("Should be able to show User profile", async () => {
    const user = {
      email: "ad@test.com.br",
      password: "admin",
    }
    const authResponse = await request(app).post('/api/v1/sessions').send(user);

    const { token } = authResponse.body;

    const response = await request(app).get('/api/v1/profile').set({ Authorization: `Bearer ${token}` });
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual(user.email);
  });

  it("Should not be able to show user profile for a nonexistent user", async () => {
    const response = await request(app).get('/api/v1/profile').set({ Authorization: `Bearer TestingSuperJWT` });

    expect(response.status).toBe(401);
  });
});
