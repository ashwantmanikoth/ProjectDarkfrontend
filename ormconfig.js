module.exports = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "mydatabase",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
};
