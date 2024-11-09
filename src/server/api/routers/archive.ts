import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import * as ohash from "ohash";
import { getLatestVersionPackages } from "~/lib/package";
import { getUrl, uploadObject } from "~/server/s3";
import { type AppContext } from "../types";
import { authorizeRequest } from "../util";

const archiveRouter = new OpenAPIHono<AppContext>();

archiveRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    description: "Upload package definitions to S3",
    responses: {
      200: {
        description: "Packages uploaded",
        content: {
          "application/json": {
            schema: z.object({
              url: z.string().openapi({
                description: "URL of the uploaded package definitions",
              }),
              sha256: z.string().openapi({
                description: "SHA256 checksum of the uploaded package definitions",
              }),
            }),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({
                description: "Error message",
                example: "Unauthorized",
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

    const latestPackages = await getLatestVersionPackages(c.env.DB);
    const json = JSON.stringify(latestPackages);
    const sha256 = ohash.sha256(json);

    const today = new Date().toISOString().split("T")[0];
    const key = `${today}-${sha256}.json`;
    const { $metadata: metadata, ...response } = await uploadObject({
      Key: key,
      Body: json,
    });
    console.log({ metadata, ...response });

    return c.json({ url: getUrl(key), sha256 }, 200);
  },
);

export default archiveRouter;
