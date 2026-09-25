// Local type-check adapter only. Supabase Edge Functions supply Deno at runtime.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};
declare module "npm:@supabase/supabase-js@2.108.2" {
  export const createClient: typeof import("@supabase/supabase-js").createClient;
}
