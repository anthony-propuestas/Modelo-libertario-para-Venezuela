/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types/2023-07-01" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_SECRET: string;
  RESEND_API_KEY: string;
}
