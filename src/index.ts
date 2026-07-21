import type {
  ExecutionContext,
  KVNamespace,
  R2Bucket,
  ScheduledEvent,
} from '@cloudflare/workers-types';

export interface Env {
  BLOCKLIST_KV: KVNamespace;
  R2_BUCKET: R2Bucket;
  ASSETS?: { fetch: typeof fetch };
  ENVIRONMENT: string;
  OMNIROUTE_API_KEY: string;
  OMNIROUTE_ENDPOINT: string;
  FIRECRAWL_API_KEY?: string;
  FIRECRAWL_ENDPOINT?: string;
}

export default {
  async scheduled(_event: ScheduledEvent, _env: Env, ctx: ExecutionContext): Promise<void> {
    // This will be implemented in Phase 4: Cron Worker
    // For now, just call the handler
    ctx.waitUntil(this.handleCronTrigger());
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle different routes
    if (url.pathname === '/') {
      return new Response('Gambling Blocklist API', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    if (url.pathname === '/api/blocklist') {
      return await this.handleBlocklistRequest(env);
    }
    
    if (url.pathname === '/api/status') {
      return this.handleStatusRequest(env);
    }
    
    if (url.pathname === '/api/update') {
      // This will be implemented in Phase 4: Cron Worker
      return new Response('Update endpoint - coming soon', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },

  async handleCronTrigger(): Promise<void> {
    // Phase 4: Cron Worker implementation
    // This will be implemented later
  },

  async handleBlocklistRequest(env: Env): Promise<Response> {
    try {
      // Phase 3: Storage implementation
      const blocklist = await env.BLOCKLIST_KV.get('current-blocklist', 'json');
      
      if (!blocklist) {
        return new Response(JSON.stringify({ error: 'Blocklist not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(blocklist), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  handleStatusRequest(env: Env): Response {
    const status = {
      environment: env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    return new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};