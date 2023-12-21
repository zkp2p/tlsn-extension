import browser from 'webextension-polyfill';
import {
  BackgroundAction,
  BackgroundActiontype,
  handleFinishProveRequest,
} from '../Background/rpc';
import { urlify } from '../../utils/misc';
import { prove, verify } from 'tlsn-js';

export const initRPC = () => {
  console.log('initRPC()');
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    switch (request.type) {
      case BackgroundActiontype.process_prove_request:
        return handleProcessProveRequest(request, sendResponse);
      case BackgroundActiontype.verify_proof:
        return handleVerifyProof(request, sendResponse);
      case BackgroundActiontype.verify_prove_request:
        return handleVerifyProofRequest(request, sendResponse);
      default:
        break;
    }
  });
};

export async function handleProcessProveRequest(
  request: BackgroundAction,
  sendResponse: (data?: any) => void,
) {
  const { handleFinishProveRequest } = await import('../Background/rpc');

  const {
    url,
    method,
    headers,
    body = '',
    maxTranscriptSize,
    notaryUrl,
    websocketProxyUrl,
    id,
    secretHeaders,
    secretResps,
  } = request.data;

  try {
    const token = urlify(url)?.hostname || '';
    console.log(token);
    const proof = await prove(url, {
      method,
      headers,
      body,
      maxTranscriptSize,
      notaryUrl,
      websocketProxyUrl: websocketProxyUrl + `?token=${token}`,
      secretHeaders,
      secretResps,
    });
    console.log(proof);

    const r = {
      type: BackgroundActiontype.finish_prove_request,
      data: {
        id,
        proof,
      },
    };

    if (chrome && (chrome as any).offscreen) {
      await browser.runtime.sendMessage(r);
    } else {
      await handleFinishProveRequest(r, () => null);
    }
  } catch (error) {
    const r = {
      type: BackgroundActiontype.finish_prove_request,
      data: {
        id,
        error,
      },
    };

    if (chrome && (chrome as any).offscreen) {
      await browser.runtime.sendMessage(r);
    } else {
      await handleFinishProveRequest(r, () => null);
    }
  }

  sendResponse();
}

async function handleVerifyProof(
  request: BackgroundAction,
  sendResponse: (data?: any) => void,
) {
  const result = await verify(request.data);
  sendResponse(result);
}

async function handleVerifyProofRequest(
  request: BackgroundAction,
  sendResponse: (data?: any) => void,
) {
  const result = await verify(request.data.proof);

  if (result) {
    return browser.runtime.sendMessage({
      type: BackgroundActiontype.finish_prove_request,
      data: {
        id: request.data.id,
        verification: {
          sent: result.sent,
          recv: result.recv,
        },
      },
    });
  }
}
