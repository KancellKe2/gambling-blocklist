import type {
  ExecutionContext,
  KVNamespace,
  R2Bucket,
  ScheduledEvent,
} from '@cloudflare/workers-types';
import { CronManager } from './cron';
import { Storage } from './storage';

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
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cronManager = new CronManager(env);
    ctx.waitUntil(cronManager.run(ctx));
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
      return await this.handleUpdateRequest(env);
    }
    
    if (url.pathname.startsWith('/api/blocklist/')) {
      const format = url.pathname.split('/api/blocklist/')[1];
      return await this.handleBlocklistFormatRequest(env, format);
    }
    
    return new Response('Not Found', { status: 404 });
  },

  async handleBlocklistRequest(env: Env): Promise<Response> {
    try {
      const storage = new Storage(env.BLOCKLIST_KV);
      const blocklist = await storage.getBlocklist();
      
      if (!blocklist) {
        return new Response(JSON.stringify({ error: 'No blocklist found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(blocklist), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  async handleBlocklistFormatRequest(env: Env, format: string): Promise<Response> {
    try {
      const formatMap: Record<string, string> = {
        'adguard': 'blocklist:adguard',
        'hosts': 'blocklist:hosts',
        'dnsmasq': 'blocklist:dnsmasq',
        'plain': 'blocklist:plain',
        'abp': 'blocklist:abp',
      };

      const key = formatMap[format];
      if (!key) {
        return new Response(JSON.stringify({ error: 'Invalid format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const content = await env.BLOCKLIST_KV.get(key);
      if (!content) {
        return new Response(JSON.stringify({ error: 'Blocklist not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const contentTypes: Record<string, string> = {
        'adguard': 'text/plain',
        'hosts': 'text/plain',
        'dnsmasq': 'text/plain',
        'plain': 'text/plain',
        'abp': 'text/plain',
      };

      return new Response(content, {
        headers: { 'Content-Type': contentTypes[format] || 'text/plain' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  async handleUpdateRequest(env: Env): Promise<Response> {
    try {
      const cronManager = new CronManager(env);
      await cronManager.run({} as ExecutionContext);
      
      return new Response(JSON.stringify({ status: 'Update triggered' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
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
      endpoints: {
        blocklist: '/api/blocklist',
        status: '/api/status',
        update: '/api/update',
        formats: [
          '/api/blocklist/adguard',
          '/api/blocklist/hosts',
          '/api/blocklist/dnsmasq',
          '/api/blocklist/plain',
          '/api/blocklist/abp',
        ],
      },
    };
    
    return new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};