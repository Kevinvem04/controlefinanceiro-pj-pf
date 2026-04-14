import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErrorMsg(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Registo realizado com sucesso! Pode fazer login agora.');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro interno...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-active-blue/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-surface/80 backdrop-blur-md border border-dark-border rounded-xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
             Finkev
           </h1>
           <p className="text-slate-400 text-sm">
             Motor financeiro de alta performance
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">E-mail Corporativo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px] text-slate-200"
              placeholder="exemplo@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Palavra-passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px] text-slate-200"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-expense-crimson/10 border border-expense-crimson/20 text-expense-crimson text-sm font-medium">
               {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-profit-neon/10 border border-profit-neon/20 text-profit-neon text-sm font-medium">
               {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-active-blue hover:bg-active-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all min-h-[44px] mt-4"
          >
            {loading ? 'Inicializando...' : (isLogin ? 'Entrar no Sistema' : 'Registar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
            className="text-sm text-slate-400 hover:text-slate-200 min-h-[44px]"
          >
            {isLogin ? 'Ainda não tem conta? Registe-se' : 'Já tem conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
