import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.post("api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  });

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.json({ jwt });
});

app.post("api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    return c.json({
      message: "Email or password is wrong!",
    });
  }

  if (body.password !== user.password) {
    return c.json({
      message: "Email or password is wrong!",
    });
  }

  return c.json({
    message: "Logged in successfully",
    user,
  });
});

app.post("api/v1/blog", (c) => {
  return c.text("hello from blog");
});

app.put("api/v1/blog", (c) => {
  return c.text("hello from blog");
});

app.get("api/v1/blog/:id", (c) => {
  return c.text("hello from blog");
});

export default app;
