/// <reference types="../worker-configuration.d.ts" />

import { CursorTracker } from '../worker/durable-objects/CursorTracker'

export interface Env {
  CURSOR_TRACKER: DurableObjectNamespace<CursorTracker>
  ASSETS: Fetcher
}

declare module "h3" {
  interface H3EventContext {
    cf: CfProperties;
    cloudflare: {
      request: Request;
      env: Env;
      context: ExecutionContext;
    };
  }
}

export {};
