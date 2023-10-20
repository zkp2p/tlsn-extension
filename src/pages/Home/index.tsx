import React, {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import Icon from '../../components/Icon';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import { useActiveTabUrl, useRequests } from '../../reducers/requests';
import { Link } from 'react-router-dom';
import { filterByBookmarks } from '../../../utils/bookmark';
import { get, NOTARY_API_LS_KEY, PROXY_API_LS_KEY } from '../../utils/storage';
import { BackgroundActiontype } from '../Background/actionTypes';

export default function Home(): ReactElement {
  const requests = useRequests();
  const url = useActiveTabUrl();
  const navigate = useNavigate();
  const suggestions = filterByBookmarks(requests);
  const [wasmRes, setWasmRes] = useState('');

  return (
    <div className="flex flex-col gap-4 py-4 overflow-y-auto">
      <div className="flex flex-col flex-nowrap justify-center gap-2 mx-4">
        <NavButton fa="fa-solid fa-table" onClick={() => navigate('/requests')}>
          <span>Requests</span>
          <span>{`(${requests.length})`}</span>
        </NavButton>
        <NavButton
          fa="fa-solid fa-magnifying-glass"
          onClick={() => navigate('/custom')}
        >
          Custom
        </NavButton>
        <NavButton
          fa="fa-solid fa-magnifying-glass"
          onClick={() => navigate('/verify')}
          disabled
        >
          Verify
        </NavButton>
        <NavButton fa="fa-solid fa-list" onClick={() => navigate('/history')}>
          History
        </NavButton>
        <NavButton fa="fa-solid fa-gear" onClick={() => navigate('/options')}>
          Options
        </NavButton>
      </div>
      <div className="flex flex-col flex-nowrap justify-center items-center gap-2 bg-slate-100 border border-slate-200 p-2">
        <div className="text-sm text-slate-300">
          <b>Development Only</b>
        </div>
        <div className="flex flex-row flex-nowrap justify-center">
          <button
            className="right-2 bg-primary/[0.9] text-white font-bold px-2 py-0.5 hover:bg-primary/[0.8] active:bg-primary"
            onClick={async () => {
              const notaryUrl = await get(NOTARY_API_LS_KEY);
              const websocketProxyUrl = await get(PROXY_API_LS_KEY);
              const userAgent =
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
              const authToken = 'a28cae3969369c26c1410f5bded83c3f4f914fbc';
              const accessToken =
                'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
              const csrfToken =
                'b73b3488687683372af2ea77486a444ccaa5327bbabad709df1b5161a6b83c8d7ec19106a82cb8dd5f8569632ee95ab4c6dc2abf5ad2ed7fa11b8340fcbe86a8fc00df28db6c4109a807f7cb12dd19da';
              const twitterId = '0xTsukino';
              const maxTranscriptSize = 16384;

              const res: any = await chrome.runtime.sendMessage<any, string>({
                type: BackgroundActiontype.prove_request_start,
                data: {
                  url: 'https://api.twitter.com/1.1/account/settings.json',
                  method: 'GET',
                  headers: {
                    Host: 'api.twitter.com',
                    Accept: '*/*',
                    'Accept-Encoding': 'identity',
                    Connection: 'close',
                    'User-Agent': userAgent,
                    Authorization: `Bearer ${accessToken}`,
                    Cookie: `auth_token=${authToken}; ct0=${csrfToken}`,
                    'X-Csrf-Token': csrfToken,
                  },
                  body: '',
                  maxTranscriptSize,
                  notaryUrl,
                  websocketProxyUrl,
                },
              });

              console.log(res);
            }}
          >
            Notarize
          </button>
        </div>
        {wasmRes && <div>{wasmRes}</div>}
      </div>
      {!suggestions.length && (
        <div className="flex flex-col flex-nowrap">
          <div className="flex flex-col items-center justify-center text-slate-300 cursor-default select-none">
            <div>No available notarization for {url?.hostname}</div>
            <div>
              Browse <Link to="/requests">Requests</Link>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col px-4 gap-4">
        {suggestions.map((bm, i) => {
          try {
            const reqs = requests.filter((req) => {
              return req?.url?.includes(bm.url);
            });

            return (
              <div
                key={i}
                className="flex flex-col flex-nowrap border rounded-md p-2 gap-1 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex flex-row items-center text-xs">
                  <div className="bg-slate-200 text-slate-400 px-1 py-0.5 rounded-sm">
                    {bm.method}
                  </div>
                  <div className="text-slate-400 px-2 py-1 rounded-md">
                    {bm.type}
                  </div>
                </div>
                <div className="font-bold">{bm.title}</div>
                <div className="italic">{bm.description}</div>
                <div className="text-slate-300">
                  Found {reqs.length} request
                </div>
                {reqs.map((r) => (
                  <Link
                    to={`/requests/${r.requestId}`}
                    className="break-all text-slate-500 truncate"
                  >
                    {r.url}
                  </Link>
                ))}
              </div>
            );
          } catch (e) {
            return null;
          }
        })}
      </div>
    </div>
  );
}

function NavButton(props: {
  fa: string;
  children?: ReactNode;
  onClick?: MouseEventHandler;
  className?: string;
  disabled?: boolean;
}): ReactElement {
  return (
    <button
      className={classNames(
        'flex flex-row flex-nowrap items-center justify-center',
        'text-white rounded px-2 py-1 gap-1',
        {
          'bg-primary/[.8] hover:bg-primary/[.7] active:bg-primary':
            !props.disabled,
          'bg-primary/[.5]': props.disabled,
        },
        props.className,
      )}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <Icon className="flex-grow-0 flex-shrink-0" fa={props.fa} size={1} />
      <span className="flex-grow flex-shrink w-0 flex-grow font-bold">
        {props.children}
      </span>
    </button>
  );
}
