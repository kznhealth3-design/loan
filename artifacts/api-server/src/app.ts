import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://loango.vercel.app",
  "https://loango-frontend.vercel.app",
  "https://loan-1-iaa2.onrender.com",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:18115",
].filter(Boolean);

const replitDomain = process.env.REPLIT_DEV_DOMAIN;

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    if (allowedOrigins.includes(origin)) { callback(null, true); return; }
    if (replitDomain && origin.endsWith(replitDomain)) { callback(null, true); return; }
    callback(new Error("Not allowed by CORS"));
  },
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF defense-in-depth: because the session cookie is SameSite=None in
// production, reject state-changing requests whose Origin header is present but
// not in our allow-list. CORS blocks reading responses but simple requests
// still reach the server, so this guards the actual mutation.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
app.use((req, res, next) => {
  if (MUTATING_METHODS.has(req.method)) {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin) && !(replitDomain && origin.endsWith(replitDomain))) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }
  }
  next();
});

app.use(authMiddleware);

app.use("/api", router);

export default app;
