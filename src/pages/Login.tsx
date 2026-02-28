import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 mb-4">
            <span className="text-blue-400 font-bold text-xl">P</span>
          </div>
          <h1 className="text-white text-2xl font-bold">PulseOps</h1>
          <p className="text-gray-500 text-sm mt-1">Workforce management platform</p>
        </div>

        <div className="card p-6">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-[#1a1d2e] rounded-lg mb-5">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Email</label>
              <input
                type="email"
                className="input w-full text-sm h-9"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Password</label>
              <input
                type="password"
                className="input w-full text-sm h-9"
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center h-9 text-sm mt-1 disabled:opacity-50"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          Any email + password (8+ chars) to create an account
        </p>
      </div>
    </div>
  );
}
