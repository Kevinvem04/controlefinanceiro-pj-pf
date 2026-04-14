import { useMemo } from 'react';

export default function CompareView({ store, dateRange }) {
  const { start, end } = dateRange;

  const calculateMetrics = (entity) => {
    let inc = 0, exp = 0;
    const txs = store.transactions.filter(t => t.entity === entity && t.date >= start && t.date <= end);
    txs.forEach(t => {
      if (t.type === 'Receita') inc += t.amount;
      else exp += t.amount;
    });
    return { inc, exp, net: inc - exp, txs };
  };

  const pf = calculateMetrics('PF');
  const pj = calculateMetrics('PJ');

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getTopCategories = (txs) => {
    const map = {};
    txs.forEach(t => {
      if (t.type === 'Despesa') {
        const cat = store.categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria';
        map[cat] = (map[cat] || 0) + t.amount;
      }
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <p className="text-slate-400">Esta tela evidencia o Fluxo Principal: Como o dinheiro que entra na Empresa (PJ) flui como lucro ou pró-labore para o Individual (PF).</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 h-full min-h-0">
        
        {/* Left Side: PJ */}
        <div className="glass-card flex flex-col p-6 overflow-auto">
           <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">Mundo PJ (Empresa)</h2>
           
           <div className="space-y-4 mb-8">
             <div className="bg-dark-bg/50 p-4 rounded-lg flex justify-between border border-dark-border">
               <span className="text-slate-400">Receita Total</span>
               <span className="text-profit-neon font-bold">{formatCurrency(pj.inc)}</span>
             </div>
             <div className="bg-dark-bg/50 p-4 rounded-lg flex justify-between border border-dark-border">
               <span className="text-slate-400">Despesa Operacional</span>
               <span className="text-expense-crimson font-bold">{formatCurrency(pj.exp)}</span>
             </div>
             <div className="bg-dark-bg p-4 rounded-lg flex justify-between border-2 border-active-blue/30">
               <span className="text-slate-300 font-semibold">Caixa Gerado</span>
               <span className="text-white font-bold">{formatCurrency(pj.net)}</span>
             </div>
           </div>

           <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-dark-border pb-2">Top 5 Maiores Despesas</h3>
           <ul className="space-y-3">
             {getTopCategories(pj.txs).map(([name, amount], idx) => (
               <li key={idx} className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">{name}</span>
                 <span className="font-mono text-slate-200">{formatCurrency(amount)}</span>
               </li>
             ))}
             {getTopCategories(pj.txs).length === 0 && <li className="text-slate-500 text-sm">Nenhuma despesa.</li>}
           </ul>
        </div>

        {/* Right Side: PF */}
        <div className="glass-card flex flex-col p-6 overflow-auto">
           <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-6">Mundo PF (Pessoal)</h2>
           
           <div className="space-y-4 mb-8">
             <div className="bg-dark-bg/50 p-4 rounded-lg flex justify-between border border-dark-border">
               <span className="text-slate-400">Entradas (Pró-Labore/Lucro)</span>
               <span className="text-profit-neon font-bold">{formatCurrency(pf.inc)}</span>
             </div>
             <div className="bg-dark-bg/50 p-4 rounded-lg flex justify-between border border-dark-border">
               <span className="text-slate-400">Custo de Vida</span>
               <span className="text-expense-crimson font-bold">{formatCurrency(pf.exp)}</span>
             </div>
             <div className="bg-dark-bg p-4 rounded-lg flex justify-between border-2 border-profit-neon/30">
               <span className="text-slate-300 font-semibold">Patrimônio / Sobra</span>
               <span className="text-white font-bold">{formatCurrency(pf.net)}</span>
             </div>
           </div>

           <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-dark-border pb-2">Top 5 Maiores Despesas</h3>
           <ul className="space-y-3">
             {getTopCategories(pf.txs).map(([name, amount], idx) => (
               <li key={idx} className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">{name}</span>
                 <span className="font-mono text-slate-200">{formatCurrency(amount)}</span>
               </li>
             ))}
             {getTopCategories(pf.txs).length === 0 && <li className="text-slate-500 text-sm">Nenhuma despesa.</li>}
           </ul>
        </div>
      </div>
    </div>
  );
}
