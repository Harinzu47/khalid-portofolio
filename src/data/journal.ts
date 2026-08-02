import { JournalPost } from '@/types';

/**
 * Journal posts for hzcode.my.id
 * Ordered newest-first.
 */
export const journalPosts: JournalPost[] = [
  {
    slug: 'fixing-n1-query',
    title: 'Fixing N+1 Query in Rank Leaderboard',
    date: '2025-11-15',
    tags: ['web-dev', 'php', 'database', 'laravel'],
    readTime: '~5 min',
    excerpt:
      'A leaderboard page was making 300+ DB queries per page load. Here\'s how I tracked it down and fixed it with eager loading.',
    content: `
## The Problem

After deploying the leaderboard feature on the FLC LMS, I noticed response times climbing to 2–3 seconds on pages with 50+ students. A quick Laravel Debugbar check revealed **317 database queries per page load**. Classic N+1.

The offending code:

\`\`\`php
// Before: N+1 queries — 1 query for rankings + N queries for each user
$rankings = Ranking::orderBy('score', 'desc')->get();

foreach ($rankings as $rank) {
    echo $rank->user->name;         // extra query
    echo $rank->course->title;      // extra query
}
\`\`\`

## Why It Happens

Laravel's Eloquent is lazy by default. When you access a relationship on a model instance (like \`$rank->user\`), it fires a new SQL query for each instance. With 100 students, that's 100 extra \`SELECT\` queries just for names.

## The Fix

Eager load the relationships upfront using \`with()\`:

\`\`\`php
// After: 3 queries total regardless of list size
$rankings = Ranking::with(['user', 'course'])
    ->orderBy('score', 'desc')
    ->get();
\`\`\`

Debugbar went from 317 queries to **3 queries**. Page load dropped from ~2.8s to **~180ms**.

## Spotting N+1 in Production

If you don't have Debugbar in prod, enable Laravel's query log temporarily:

\`\`\`php
DB::enableQueryLog();
// ... your code ...
dd(DB::getQueryLog()); // inspect in local dev
\`\`\`

Or use [Laravel Telescope](https://laravel.com/docs/telescope) for persistent monitoring.

## Key Takeaway

Always profile before optimizing. The fix here took 2 minutes once I knew where to look. The investigation took 20 minutes. Tooling matters.
    `,
  },
  {
    slug: 'https-lets-encrypt-cloudflare',
    title: 'HTTPS Setup via Let\'s Encrypt + Cloudflare',
    date: '2025-10-03',
    tags: ['infra', 'networking', 'ssl', 'nginx', 'cloudflare'],
    readTime: '~8 min',
    excerpt:
      'Setting up free HTTPS on a VPS with Let\'s Encrypt and Certbot, fronted by Cloudflare for DDoS protection and cache.',
    content: `
## Why Both Let's Encrypt AND Cloudflare?

Let's Encrypt gives you a free TLS certificate for your origin server. Cloudflare acts as a reverse proxy in front of it, adding DDoS protection, caching, and a second layer of TLS termination. The combination gives you:

- **Origin → Cloudflare**: full TLS (your Let's Encrypt cert)
- **Cloudflare → User**: Cloudflare's cert (handled automatically)

This is called **Full (Strict)** mode in Cloudflare's SSL/TLS settings.

## Step 1 — Install Certbot

\`\`\`bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
\`\`\`

## Step 2 — Obtain Certificate

Before running Certbot, temporarily pause Cloudflare's proxy (set DNS record to DNS-only, grey cloud). This lets Certbot's HTTP-01 challenge reach your server directly.

\`\`\`bash
sudo certbot --nginx -d hzcode.my.id -d www.hzcode.my.id
\`\`\`

Certbot will automatically modify your Nginx config to add the SSL block.

## Step 3 — Nginx Config

After Certbot runs, your \`/etc/nginx/sites-available/hzcode\` will look like:

\`\`\`nginx
server {
    listen 443 ssl;
    server_name hzcode.my.id www.hzcode.my.id;

    ssl_certificate     /etc/letsencrypt/live/hzcode.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hzcode.my.id/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name hzcode.my.id www.hzcode.my.id;
    return 301 https://$host$request_uri;
}
\`\`\`

## Step 4 — Re-enable Cloudflare Proxy

Turn the proxy back on (orange cloud). Set SSL/TLS mode to **Full (Strict)** in Cloudflare dashboard.

## Step 5 — Auto-Renewal

Certbot installs a systemd timer automatically. Verify it:

\`\`\`bash
sudo systemctl status certbot.timer
# Test renewal dry-run:
sudo certbot renew --dry-run
\`\`\`

## Gotchas

- **Cloudflare flexible mode** will break things if your origin has a valid cert — always use Full (Strict)
- **Rate limits**: Let's Encrypt limits to 5 certs/domain/week — don't hammer it while testing
- If using Docker, make sure the Certbot container can write to the \`/etc/letsencrypt\` volume
    `,
  },
  {
    slug: 'mtcna-exam-prep',
    title: 'MTCNA Exam Prep Notes',
    date: '2025-09-12',
    tags: ['networking', 'mikrotik', 'mtcna', 'certification'],
    readTime: '~12 min',
    excerpt:
      'Key topics, gotchas, and lab exercises that helped me pass the MikroTik Certified Network Associate exam.',
    content: `
## Overview

The MTCNA (MikroTik Certified Network Associate) is a vendor certification covering RouterOS fundamentals. The exam is practical-focused: expect config questions, not just theory. Here are the areas I focused on.

## Topic 1 — Interface & Addressing

Know the difference between:
- **/ip address** — assigns IP to interface
- **/ip route** — static routing table
- Bridge interfaces vs. routed interfaces

\`\`\`routeros
# Assign IP to ether1
/ip address add address=192.168.1.1/24 interface=ether1

# Verify
/ip address print
\`\`\`

## Topic 2 — Firewall Chains

The three chains and when packets hit them:
- **input** — traffic destined *for the router itself*
- **forward** — traffic *passing through* the router
- **output** — traffic *originating from* the router

A common trap: blocking SSH to the router requires an **input** rule, not forward.

\`\`\`routeros
# Allow established/related connections (always put first)
/ip firewall filter add chain=input connection-state=established,related action=accept

# Drop invalid
/ip firewall filter add chain=input connection-state=invalid action=drop

# Allow SSH from management VLAN only
/ip firewall filter add chain=input protocol=tcp dst-port=22 src-address=10.0.1.0/24 action=accept

# Drop everything else on input
/ip firewall filter add chain=input action=drop
\`\`\`

## Topic 3 — NAT (Masquerade)

For basic internet sharing:

\`\`\`routeros
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade
\`\`\`

**Masquerade** vs **src-nat**: masquerade dynamically uses the WAN interface IP (good for DHCP WAN), src-nat requires a static out-address.

## Topic 4 — DHCP Server

\`\`\`routeros
/ip pool add name=lan-pool ranges=192.168.88.10-192.168.88.254
/ip dhcp-server add name=lan interface=bridge1 address-pool=lan-pool disabled=no
/ip dhcp-server network add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=8.8.8.8
\`\`\`

## Topic 5 — Wireless (if applicable)

Know the modes: **ap bridge**, **station bridge**, **station**, **wds slave**. The exam may have a wireless bridging topology question.

## Lab Setup

I used GNS3 with the RouterOS CHR (Cloud-Hosted Router) image. Set up:
1. Two routers connected back-to-back
2. Practiced firewall rules until traffic flow was predictable
3. Added a third router for static routing exercise

## Exam Tips

- Read every question carefully — "which **chain**" is a common trap word
- Know the winbox shortcut keys for print/detail view
- Practice \`/tool traceroute\` and \`/tool ping\` commands
- Time management: 25 questions, 30 minutes — don't overthink

Passed on first attempt with 86%. The hands-on lab practice in GNS3 was the difference.
    `,
  },
  {
    slug: 'docker-multistage-laravel',
    title: 'Docker Multi-Stage Builds for Laravel',
    date: '2025-08-20',
    tags: ['infra', 'docker', 'laravel', 'devops'],
    readTime: '~6 min',
    excerpt:
      'How I cut the Laravel Docker image from 800MB to 180MB using multi-stage builds — with the exact Dockerfile.',
    content: `
## The Problem with a Naive Laravel Dockerfile

A simple single-stage Dockerfile for Laravel pulls in Composer, all dev dependencies, build tools, and the Node.js runtime for asset compilation. My initial image was **812MB**. That's slow to push, slow to pull, and a larger attack surface.

Multi-stage builds solve this by using a **builder stage** (fat, with all tools) and a **production stage** (lean, only what the app needs at runtime).

## The Dockerfile

\`\`\`dockerfile
# ─── Stage 1: Node asset builder ───────────────────────────────────────────
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: PHP Composer builder ────────────────────────────────────────
FROM composer:2.7 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \\
    --no-dev \\
    --no-scripts \\
    --no-autoloader \\
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize

# ─── Stage 3: Production image ────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS production

# Install only runtime PHP extensions
RUN apk add --no-cache \\
    nginx \\
    supervisor \\
    && docker-php-ext-install pdo_mysql opcache

WORKDIR /var/www/html

# Copy only what we need from builders
COPY --from=composer-builder /app/vendor ./vendor
COPY --from=composer-builder /app .
COPY --from=node-builder /app/public/build ./public/build

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
\`\`\`

## Result

| Stage | Image Size |
|-------|-----------|
| Before (single stage) | 812 MB |
| After (multi-stage) | 183 MB |

**77% reduction.** CI pipeline push time dropped from ~4 min to ~55 seconds.

## Key Points

- \`--no-dev\` on Composer install excludes dev packages (PHPUnit, Faker, etc.)
- \`dump-autoload --optimize\` generates a classmap for faster PSR-4 resolution
- \`npm ci\` (not \`npm install\`) for reproducible builds from lockfile
- Only the final stage ends up in the pushed image — builder stages are discarded
    `,
  },
];

/**
 * Get journal post by slug
 */
export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  return journalPosts.find((post) => post.slug === slug);
}

/**
 * Get all journal posts (newest first)
 */
export function getAllJournalPosts(): JournalPost[] {
  return [...journalPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
