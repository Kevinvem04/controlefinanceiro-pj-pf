import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function DashboardUnificado({ entity, store, dateRange }) {
  const { start, end } = dateRange;

  // Filtragem Mestre
  const filteredTxs = useMemo(() => {
    return store.transactions.filter(t => {
      const isDateValid = t.date >= start && t.date <= end;
      const isEntityValid = entity === 'ALL' || t.entity === entity;
      return isDateValid && isEntityValid;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [store.transactions, entity, start, end]);

  // Cálculos Operacionais e Geração de Caixa
  const metrics = useMemo(() => {
    let incomePJ = 0, expensePJ = 0;
    let incomePF = 0, expensePF = 0;
    
    // Rastreadores de transferências internas (Aportes / Distribuição de Lucros)
    let tfInPJ = 0, tfOutPJ = 0;
    let tfInPF = 0, tfOutPF = 0;
    
    // Identificar transferências de forma retroativa (inclusive para as que o usuário criou antes da flag auto-transfer)
    const parentIds = new Set(filteredTxs.filter(t => t.linkedFromId).map(t => t.linkedFromId));
    const isInternal = (t) => {
       if (t.isTransfer || t.linkedFromId || parentIds.has(t.id)) return true;
       // Safety net retroativa: se for da Categoria "Distribuição/Aporte"
       const catObj = store.categories.find(c => c.id === t.categoryId);
       return catObj && (catObj.name.includes('Distribuição de Lucros') || catObj.name.toLowerCase().includes('aporte'));
    };

    filteredTxs.forEach(t => {
      const internal = isInternal(t);
      if (t.entity === 'PJ') {
        if (t.type === 'Receita') {
            if (internal) tfInPJ += t.amount; else incomePJ += t.amount;
        } else {
            if (internal) tfOutPJ += t.amount; else expensePJ += t.amount;
        }
      } else {
         if (t.type === 'Receita') {
            if (internal) tfInPF += t.amount; else incomePF += t.amount;
         } else {
            if (internal) tfOutPF += t.amount; else expensePF += t.amount;
         }
      }
    });

    // Faturamento e Despesa contam apenas Operacional (Ignorando 100% Sugões/Aportes/Lucros)
    const totalIncome = entity === 'ALL' ? incomePJ + incomePF : (entity === 'PJ' ? incomePJ : incomePF);
    const totalExpense = entity === 'ALL' ? expensePJ + expensePF : (entity === 'PJ' ? expensePJ : expensePF);

    // O Caixa Líquido precisa dessas variações para refletir o saldo da conta bacária real
    const netPJ = (incomePJ + tfInPJ) - (expensePJ + tfOutPJ);
    const netPF = (incomePF + tfInPF) - (expensePF + tfOutPF);
    
    const totalNet = entity === 'ALL' ? netPJ + netPF : (entity === 'PJ' ? netPJ : netPF);

    return { 
      totalIncome, totalExpense, totalNet,
      incomePJ, expensePJ, incomePF, expensePF,
      netPJ, netPF
    };
  }, [filteredTxs, entity, store.categories]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Gráfico de Barras Duplo (Agrupando Categorias)
  const chartData = useMemo(() => {
    const map = {};
    filteredTxs.forEach(t => {
      // Para o gráfico unificado, concatenamos o nome da categoria com a flag pra clareza se for ALL
      const catName = store.categories.find(c => c.id === t.categoryId)?.name || 'Outros';
      const label = entity === 'ALL' ? `${catName} (${t.entity})` : catName;
      
      if (!map[label]) map[label] = { name: label, Receita: 0, Despesa: 0 };
      
      if (t.type === 'Receita') map[label].Receita += t.amount;
      else map[label].Despesa += t.amount;
    });
    
    // Sort by Total Volume and take Top 6
    return Object.values(map)
      .sort((a,b) => (b.Receita + b.Despesa) - (a.Receita + a.Despesa))
      .slice(0, 6);
  }, [filteredTxs, store.categories, entity]);

  return (
    <div className="space-y-8 flex flex-col h-full w-full">
      
      {/* Indicadores Topo (Swipe no Mobile, Grid no Desktop) */}
      <div className="flex w-full md:grid md:grid-cols-3 gap-4 md:gap-6 flex-shrink-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 md:pb-0">
        <div className="glass-card p-6 border-t-2 border-t-profit-neon min-w-[280px] w-[85%] md:w-auto snap-center shrink-0">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
                 Entradas Totais {entity === 'ALL' ? '(PJ + PF)' : ''}
               </p>
               <h3 className="text-3xl font-bold text-profit-neon">{formatCurrency(metrics.totalIncome)}</h3>
               {entity === 'ALL' && (
                 <div className="mt-2 text-xs flex gap-3 text-slate-500 font-medium">
                   <span className="text-blue-400">PJ: {formatCurrency(metrics.incomePJ)}</span>
                   <span className="text-emerald-400">PF: {formatCurrency(metrics.incomePF)}</span>
                 </div>
               )}
             </div>
             <div className="p-3 bg-profit-neon/10 rounded-lg text-profit-neon"><TrendingUp size={24} /></div>
          </div>
        </div>
        
        <div className="glass-card p-6 border-t-2 border-t-expense-crimson min-w-[280px] w-[85%] md:w-auto snap-center shrink-0">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
                 Saídas Totais {entity === 'ALL' ? '(PJ + PF)' : ''}
               </p>
               <h3 className="text-3xl font-bold text-expense-crimson">{formatCurrency(metrics.totalExpense)}</h3>
               {entity === 'ALL' && (
                 <div className="mt-2 text-xs flex gap-3 text-slate-500 font-medium">
                   <span className="text-blue-400">PJ: {formatCurrency(metrics.expensePJ)}</span>
                   <span className="text-emerald-400">PF: {formatCurrency(metrics.expensePF)}</span>
                 </div>
               )}
             </div>
             <div className="p-3 bg-expense-crimson/10 rounded-lg text-expense-crimson"><TrendingDown size={24} /></div>
          </div>
        </div>

        <div className="glass-card p-6 border-t-2 border-t-active-blue min-w-[280px] w-[85%] md:w-auto snap-center shrink-0">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
                 Balanço Líquido {entity === 'ALL' ? '(Consolidado)' : ''}
               </p>
               <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.totalNet)}</h3>
               {entity === 'ALL' && (
                 <div className="mt-2 text-xs flex gap-3 text-slate-500 font-medium">
                   <span className="text-blue-400">Caixa PJ: {formatCurrency(metrics.netPJ)}</span>
                   <span className="text-emerald-400">Caixa PF: {formatCurrency(metrics.netPF)}</span>
                 </div>
               )}
             </div>
             <div className="p-3 bg-active-blue/10 rounded-lg text-active-blue"><Layers size={24} /></div>
          </div>
        </div>
      </div>

      {/* Gráfico Unificado */}
      <div className="glass-card p-6 h-[320px] flex-shrink-0">
         <h3 className="text-lg font-bold mb-4 text-slate-200">Volume por Categoria Financeira (Top 6)</h3>
         <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis stroke="#64748b" tickFormatter={(val) => `R$ ${val/1000}k`} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                formatter={(val) => formatCurrency(val)}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      {/* Tabela de Atividades Gerais (O Mestre) */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden min-h-[400px]">
         <div className="p-5 border-b border-dark-border bg-dark-bg/50 shrink-0">
           <h3 className="text-lg font-bold text-slate-200">Extrato Consolidado (Geral)</h3>
         </div>
         <div className="flex-1 overflow-auto hide-scrollbar">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="sticky top-0 bg-dark-surface z-10 shadow-sm border-b border-dark-border">
                <tr>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">Data</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">Descrição</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">Entidade</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">Categoria</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-right">Valor Líquido</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {filteredTxs.map(t => (
                  <tr key={t.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="p-4 text-sm text-slate-300">
                      {format(parseISO(t.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-100">
                      {t.name}
                      {t.linkedFromId && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-active-blue/30 text-active-blue uppercase tracking-widest font-bold">Auto</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-widest ${
                         t.entity === 'PJ' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {t.entity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                       {store.categories.find(c => c.id === t.categoryId)?.name || 'Diversos'}
                       <span className="ml-2 text-xs text-slate-600">({t.type})</span>
                    </td>
                    <td className={`p-4 text-sm font-bold text-right ${t.type === 'Receita' ? 'text-profit-neon' : 'text-expense-crimson'}`}>
                      {t.type === 'Receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 text-center">
                       <button onClick={() => store.deleteTransaction(t.id)} className="text-slate-500 hover:text-expense-crimson transition-colors text-sm">
                         Apagar
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredTxs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500 text-sm">Nenhuma atividade registrada no período selecionado.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-4">
               {filteredTxs.map(t => (
                 <div key={`mob-${t.id}`} className="bg-dark-surface/50 border border-dark-border rounded-xl p-4 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-100">{t.name}</span>
                          <span className="text-[11px] text-slate-400">{format(parseISO(t.date), 'dd/MM/yyyy')}</span>
                       </div>
                       <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${t.entity === 'PJ' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                         {t.entity}
                       </span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                       <span className="text-xs text-slate-500 font-medium">
                          {store.categories.find(c => c.id === t.categoryId)?.name || 'Diversos'}
                       </span>
                       <span className={`font-bold ${t.type === 'Receita' ? 'text-profit-neon' : 'text-expense-crimson'}`}>
                          {t.type === 'Receita' ? '+' : '-'}{formatCurrency(t.amount)}
                       </span>
                    </div>
                    {/* Delete button absolutely positioned or tap-to-delete? Let's add a small icon/button */}
                    <button onClick={() => store.deleteTransaction(t.id)} className="absolute bottom-4 right-4 text-[10px] text-expense-crimson/80 font-bold p-2 hover:bg-expense-crimson/10 rounded min-h-[44px] flex items-center">
                       Excluir
                    </button>
                    <div className="flex justify-between items-end mt-2">
                       {/* Just spacer for the button room */}
                    </div>
                 </div>
               ))}
               {filteredTxs.length === 0 && (
                 <div className="p-8 text-center text-slate-500 text-sm">Nenhuma atividade registrada no período selecionado.</div>
               )}
            </div>
         </div>
      </div>

    </div>
  );
}
