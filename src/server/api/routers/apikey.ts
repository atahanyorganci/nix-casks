import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createApiKey } from "~/lib/apikey";
import { Apikey, type AppContext } from "../types";
import { authorizeRequest } from "../util";

const apikeyRouter = new OpenAPIHono<AppContext>();

apikeyRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    responses: {
      200: {
        description: "API key created",
        content: {
          "application/json": {
            schema: z.object({
              apikey: Apikey,
            }),
          },
        },
      },
      401: {
        description: "Missing or invalid API key",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({
                description: "Unauthorized",
                enum: ["Unauthorized"],
              }),
            }),
          },
        },
      },
    },
  }),
  async c => {
    const authorized = await authorizeRequest(c);
    if (!authorized) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const apikey = await createApiKey(c.env.DB);
    return c.json({ apikey }, 200);
  },
);

export default apikeyRouter;
