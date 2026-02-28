import { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, RefreshCw, Terminal, Key, Zap, ArrowRight } from 'lucide-react';
import { intercomService } from '../services/intercom';

interface Props {
  onClose: () => void;
  onConnected: (info: { name: string; workspace: string }) => void;
  /** Called when the user clicks the final "done" button. Defaults to onClose. */
  onDone?: () => void;
}

type Step = 'server' | 'token' | 'connect' | 'done';

const STEPS: { id: Step; label: string }[] = [
  { id: 'server', label: 'Start Server' },
  { id: 'token', label: 'Get Token' },
  { id: 'connect', label: 'Connect' },
  { id: 'done', label: 'Done' },
];

export default function IntercomSetupWizard({ onClose, onConnected, onDone }: Props) {
  const [step, setStep] = useState<Step>('server');
  const [serverReachable, setServerReachable] = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectedInfo, setConnectedInfo] = useState<{ name: string; workspace: string } | null>(null);

  // Poll for server reachability while on the server step
  useEffect(() => {
    if (step !== 'server') return;
    let cancelled = false;

    const check = async () => {
      const ok = await intercomService.isServerReachable();
      if (!cancelled) setServerReachable(ok);
    };

    check();
    const interval = setInterval(check, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step]);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm run dev:full').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    if (!token.trim() || isConnecting) return;
    setIsConnecting(true);
    setConnectError(null);
    try {
      await intercomService.setToken(token.trim());
      const me = await intercomService.getMe();
      const info = { name: me.name, workspace: me.app?.name ?? 'Intercom' };
      setConnectedInfo(info);
      onConnected(info);
      setStep('done');
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Connection failed – check your token');
    } finally {
      setIsConnecting(false);
    }
  };

  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={step !== 'connect' ? onClose : undefined}
    >
      <div className="card w-full max-w-lg animate-fade-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="text-white font-semibold">Connect Intercom</h3>
              <p className="text-gray-500 text-xs mt-0.5">Live conversations · Agent workload · Reply-time metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center px-6 pt-5">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold flex-shrink-0 border transition-colors ${
                i < stepIndex
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : i === stepIndex
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'border-[#2a2d3e] text-gray-600'
              }`}>
                {i < stepIndex ? <Check size={11} /> : i + 1}
              </div>
              <span className={`ml-1.5 text-xs font-medium ${
                i === stepIndex ? 'text-white' : i < stepIndex ? 'text-emerald-400' : 'text-gray-600'
              }`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < stepIndex ? 'bg-emerald-500/30' : 'bg-[#2a2d3e]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 pt-5">

          {/* ── Step 1: Start the proxy server ─────────────────────────────── */}
          {step === 'server' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Terminal size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-300 text-sm font-medium mb-1">Start the local proxy server</p>
                  <p className="text-gray-400 text-xs mb-3">
                    PulseOps uses a local proxy to reach Intercom's API, bypassing browser CORS restrictions.
                    Run this command in your project folder:
                  </p>
                  <div className="flex items-center gap-2 bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 font-mono text-sm">
                    <span className="text-emerald-400 select-none">$</span>
                    <span className="text-gray-200 flex-1">npm run dev:full</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-xs flex-shrink-0"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-600 text-[11px] mt-2">
                    This starts both the proxy (port 3001) and the Vite dev server. Already running Vite?
                    Use <code className="text-blue-400">npm run server</code> instead.
                  </p>
                </div>
              </div>

              {serverReachable ? (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-300 text-sm font-medium">Proxy server detected on port 3001</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 bg-[#1e2130] border border-[#2a2d3e] rounded-lg">
                  <RefreshCw size={13} className="text-gray-500 animate-spin flex-shrink-0" />
                  <span className="text-gray-400 text-sm">Waiting for proxy server to start…</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setStep('token')}
                  disabled={!serverReachable}
                  className="btn-primary text-sm h-9 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
                <button onClick={onClose} className="btn-secondary text-sm h-9">Cancel</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Get Intercom token ──────────────────────────────────── */}
          {step === 'token' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#22253a] border border-[#2a2d3e] rounded-xl">
                <Key size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium mb-3">Get your Intercom Access Token</p>
                  <ol className="space-y-2.5">
                    {[
                      'Log in to Intercom and open the Developer Hub',
                      <>Select your app → click <strong className="text-gray-300">Basic Information</strong></>,
                      <>Scroll to "Access Token" and click <strong className="text-gray-300">Copy</strong></>,
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#2a2d3e] text-gray-400 flex items-center justify-center text-[9px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                  <a
                    href="https://app.intercom.com/a/apps/_/developer-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                  >
                    <ExternalLink size={11} />
                    Open Intercom Developer Hub
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setStep('connect')} className="btn-primary text-sm h-9">
                  I have my token
                  <ArrowRight size={14} />
                </button>
                <button onClick={() => setStep('server')} className="btn-secondary text-sm h-9">Back</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Paste token & verify ───────────────────────────────── */}
          {step === 'connect' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  className="input w-full text-sm h-9 font-mono"
                  placeholder="dG9rO…"
                  value={token}
                  onChange={e => { setToken(e.target.value); setConnectError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') void handleConnect(); }}
                  autoFocus
                  disabled={isConnecting}
                />
              </div>

              {connectError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {connectError}
                </div>
              )}

              <div className="p-3 bg-[#1e2130] border border-[#2a2d3e] rounded-lg text-gray-500 text-xs">
                Your token is forwarded only to the local proxy (port 3001) — it never leaves your machine.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleConnect()}
                  disabled={!token.trim() || isConnecting}
                  className="btn-primary text-sm h-9 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      Test & Connect
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep('token')}
                  disabled={isConnecting}
                  className="btn-secondary text-sm h-9"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* ── Done ───────────────────────────────────────────────────────── */}
          {step === 'done' && connectedInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  💬
                </div>
                <div>
                  <p className="text-emerald-300 font-semibold">{connectedInfo.workspace}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Connected as {connectedInfo.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">Live data syncing</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed">
                Intercom is connected. Live conversation counts, unassigned queues, reply-time metrics, and
                per-agent workload will now appear in the Command Center.
              </p>

              <button onClick={onDone ?? onClose} className="btn-primary text-sm h-9">
                <Check size={13} />
                {onDone ? 'Go to Command Center' : 'Done'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
