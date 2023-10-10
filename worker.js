import * as Comlink from "comlink";
// import init, { prover } from "./pkg/tlsn_extension_rs";
import init, { initThreadPool, prover } from "./pkg/tlsn_extension_rs";

function hasSharedMemory() {
  const hasSharedArrayBuffer = "SharedArrayBuffer" in global;
  const notCrossOriginIsolated = global.crossOriginIsolated === false;

  return hasSharedArrayBuffer && !notCrossOriginIsolated;
}

const DATA = Array(20).fill(1);

class Test {
    constructor() {
        console.log('!@# test comlink');
        this.test();
    }

    async test() {
        console.log('start');
        console.log("!@# hasSharedMemory=", hasSharedMemory())
        const numConcurrency = navigator.hardwareConcurrency;
        console.log("!@# numConcurrency=", numConcurrency)
        const res = await init();
        console.log("!@# res.memory=", res.memory)
        // 6422528 ~= 6.12 mb
        console.log("!@# res.memory.buffer.length=", res.memory.buffer.byteLength)
        await initThreadPool(numConcurrency);

        const maxTranscriptSize = 1 << 14;
        const notaryHost = "localhost";
        const notaryPort = 7047;

        const serverDomain = "twitter";
        const route = "i/api/1.1/dm/conversation";
        const conversationId = "";
        const clientUuid = "";
        const authToken = "";
        const accessToken = "";
        const csrfToken = "";
        const userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
        const websocketProxyURL = "ws://localhost:55688";

        const resProver = await prover(
            maxTranscriptSize,
            notaryHost,
            notaryPort,
            serverDomain,
            route,
            conversationId,
            clientUuid,
            userAgent,
            authToken,
            accessToken,
            csrfToken,
            websocketProxyURL,
        );
        const resJSON = JSON.parse(resProver);
        console.log("!@# resAfter.memory=", res.memory)
        // 1105920000 ~= 1.03 gb
        console.log("!@# resAfter.memory.buffer.length=", res.memory.buffer.byteLength)
        console.log("!@# resJSON=", resJSON)
    }
}

Comlink.expose(Test);