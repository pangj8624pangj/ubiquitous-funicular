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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <span className="text-primary font-bold text-xl">P</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold">PulseOps</h1>
          <p className="text-muted-foreground text-sm mt-1">Workforce management platform</p>
        </div>

        <div className="card p-6">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-muted-foreground text-xs font-medium block mb-1">Email</label>
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
              <label className="text-muted-foreground text-xs font-medium block mb-1">Password</label>
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
              <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
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

        <p className="text-muted-foreground text-xs text-center mt-4">
          Any email + password (8+ chars) to create an account
        </p>
      </div>
    </div>
  );
}
