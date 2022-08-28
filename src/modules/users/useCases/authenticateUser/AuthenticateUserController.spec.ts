
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
      values('${id}', 'admin', 'admin@test.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
      await connection.dropDatabase();
      await connection.close();
  });

  it('Should be able to authenticate', async () => {
    const user = {
      email: "admin@test.com.br",
      password: "admin",
    }
    const response = await request(app).post('/api/v1/sessions').send(user);
    console.log(response);
    expect(response.status).toBe(200);
  });
  it('Should not be able to authenticate with wrong password', async () => {
    const user = {
      email: "test",
      password: "admin",
    }
    const response = await request(app).post('/api/v1/sessions').send(user);
    console.log(response);
    expect(response.status).toBe(401);
  });
  it('Should not be able to authenticate with wrong email', async () => {
    const user = {
      email: "admin@test.com.br",
      password: "test",
    }
    const response = await request(app).post('/api/v1/sessions').send(user);
    console.log(response);
    expect(response.status).toBe(401);
  });
});












// import { app } from "../../../../app";
// import request from "supertest";
// import { Connection } from "typeorm";
// import createConnection from "./../../../../database/index";

// let connection: Connection;

// describe("Authenticate User", () => {
//   beforeAll(async () => {
//     connection = await createConnection();

//     await connection.runMigrations();

//   });

//   afterAll(async () => {
//       await connection.dropDatabase();
//       await connection.close();
//   });
// });
