import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("服务端渲染需求输入、多客户入口与本地数据声明", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /欧派 AI 灵感家/);
  assert.match(html, /创建匿名客户/);
  assert.match(html, /一键使用林女士演示案例/);
  assert.match(html, /本机客户列表/);
  assert.match(html, /localStorage/);
  assert.doesNotMatch(html, /手机号码|详细住址/);
});
