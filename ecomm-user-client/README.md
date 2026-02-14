# Ecobazar – Frontend

React + Vite frontend for Ecobazar e-commerce. Uses **deployment-repo** API Gateway and microservices.

## Prerequisites

Start the **deployment-repo** backend stack first. The frontend proxies all `/api/*` to the gateway at `http://localhost:8080`.

### Start deployment-repo (Docker)

```bash
cd deployment-repo
docker-compose up -d
```

### Or start deployment-repo manually

1. Start databases: `docker-compose up -d postgres mongodb`
2. Start Eureka: `cd eureka-server && ./mvnw spring-boot:run`
3. Start API Gateway: `cd api-gateway && ./mvnw spring-boot:run`
4. Start all microservices (auth, product, inventory, order, checkout, payment, user)

See `deployment-repo/README.md` for full setup.

## Run Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. API calls go to gateway at `http://localhost:8080`.

## API Gateway URL

Default: `http://localhost:8080`. Override with `.env`:

```
VITE_API_GATEWAY_URL=http://localhost:8080
```

Production: `VITE_API_GATEWAY_URL=http://68.183.86.246:8080`

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
