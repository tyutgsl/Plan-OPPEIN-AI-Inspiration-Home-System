import { app } from "./src/app";
import { env } from "./src/config/env";

app.listen(env.PORT, () => {
  console.log(`欧派AI灵感家 API 已启动：http://localhost:${env.PORT}`);
});
