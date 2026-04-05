# weight-stats-fe

React dashboard for visualizing smart scale data. Pairs with [weight-stats-be](https://github.com/blingusblongus/weight-stats-be).

## Features

- Weight and lean mass chart with togglable series and rolling average trendlines
- Configurable rolling average window (3-30 days)
- Quick-select date ranges (1W, 2W, 1M, 3M, All) plus custom calendar pickers
- Summary stats: current weight, lean mass, body fat %, fat mass change, weekly rates, BMR, daily noise
- Expandable details section with weekly breakdowns and fat loss ratio
- Data table of all measurements

## Stack

- React 19, Vite 8, TypeScript
- Tailwind CSS v4, shadcn/ui
- Recharts

## Deploy

Containerized via GHCR with nginx. Protected by basic auth.

```yaml
# docker-compose.yml (see docker-compose.yml in this repo for full example)
weight-stats-fe:
  image: ghcr.io/blingusblongus/weight-stats-fe:latest
  ports:
    - "8084:80"
  volumes:
    - ${HOME}/weight-stats-fe/.htpasswd:/etc/nginx/.htpasswd:ro
```

Generate the htpasswd file on the server:

```bash
htpasswd -c ~/weight-stats-fe/.htpasswd <username>
```

## Local dev

```bash
npm install
npm run dev
```

Vite proxies `/api` to `localhost:8083` in dev mode.
