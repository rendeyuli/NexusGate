import { Elysia, t } from "elysia";

import { apiKeyPlugin } from "../plugins/apiKeyPlugin";
import { consola } from "consola";
import { findApiKey, listUpstreams } from "@/db";

const logger = consola.withTag("modelsQuery");

export const modelsQueryApi = new Elysia()
  .get(
    "/models",
    async ({ error }) => {
      logger.debug("queryModels");
      
      const upstreams = await listUpstreams();
      return {
          object: "list",
          data: upstreams.map(upstream => ({
            id: upstream.id,
            object: "model",
            created: upstream.createdAt.getTime(),
            owned_by: upstream.name,
          })),
        };
    },
  );