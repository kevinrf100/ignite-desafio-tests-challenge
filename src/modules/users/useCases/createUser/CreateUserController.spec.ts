
import { app } from "../../../../app";
import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "./../../../../database/index";

let connection: Connection;

describe("Create category controller", () => {
  beforeAll(async () => {
      connection = await createConnection();

      await connection.runMigrations();

  });

  afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
  });

  it("Should be able to create a user", async () => {
    const user = {
      name: 'kevin',
      email: "kevin@test.com",
      password: "admin"
    }
    const response = await request(app).post('/api/v1/users').send(user);

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user with same email", async () => {
    const user = {
      name: 'kevin',
      email: "kevin@test.com",
      password: "admin"
    }

    await request(app).post('/api/v1/users').send(user);
    const response = await request(app).post('/api/v1/users').send(user);

    expect(response.status).toBe(400);
  });

});
