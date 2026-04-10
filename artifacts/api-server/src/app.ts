import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path"; // ضيف السطر ده
import router from "./routes";
import { logger } from "./lib/logger";

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
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// راوتس الباك اند
app.use("/api", router);

// --- الكود الجديد لربط الفرونت اند ---
// تحديد مسار ملفات الفرونت اند
const frontendPath = path.join(process.cwd(), "artifacts/date-judge/dist/public");

// تشغيل ملفات الفرونت اند كـ Static
app.use(express.static(frontendPath));

// أي مسار تاني مش API هيوديك على الـ index.html بتاع الرياكت
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
// ------------------------------------

export default app;