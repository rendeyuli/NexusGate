import { Elysia } from "elysia";
import { completionsApi } from "./v1/completions";
import { usageQueryApi } from "./usage";
import { routes as adminRoutes } from "./admin";
import { modelsQueryApi } from "./v1/models";

export const routes = new Elysia()
  .group("/v1", (app) => app.use(completionsApi).use(modelsQueryApi))
  .group("/api", (app) => app.use(usageQueryApi).use(adminRoutes));
