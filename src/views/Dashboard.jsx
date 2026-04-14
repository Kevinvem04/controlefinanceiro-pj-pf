import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';

export default function Dashboard({ entity, store, dateRange }) {
  const { start, end } = dateRange;

  const filteredTxs = useMemo(() => {
    return store.transactions.filter(t => {
      const d = t.date;
      return t.entity === entity && d >= start && d <= end;
    });
  }, [store.transactions, entity, start, end]);

  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTxs.forEach(t => {
      if (t.type === 'Receita') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, net: income - expense };
  }, [filteredTxs]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Chart Data (Group by Category)
  const chartData = useMemo(() => {
    const map = {};
    filteredTxs.forEach(t => {
      const cat = store.categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria';
      if (!map[cat]) map[cat] = { name: cat, Receita: 0, Despesa: 0 };
      if (t.type === 'Receita') map[cat].Receita += t.amount;
      else map[cat].Despesa += t.amount;
    });
    return Object.values(map).sort((a,b) => (b.Receita + b.Despesa) - (a.Receita + a.Despesa)).slice(0, 5); // top 5
  }, [filteredTxs, store.categories]);

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Receita Total</p>
            <h3 className="text-3xl font-bold text-profit-neon">{formatCurrency(metrics.income)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-profit-neon/10 flex items-center justify-center text-profit-neon">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Despesa Total</p>
            <h3 className="text-3xl font-bold text-expense-crimson">{formatCurrency(metrics.expense)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-expense-crimson/10 flex items-center justify-center text-expense-crimson">
            <TrendingDown size={24} />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Lucro Líquido</p>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.net)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 glass-card p-6 h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Top 5 Categorias (Movimentação)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `R$ ${val/1000}k`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => formatCurrency(val)}
              />
              <Bar dataKey="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Despesa" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* List Details / Info */}
        <div className="col-span-1 glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Informações</h3>
          <p className="text-sm text-slate-400">
            A visão do <strong className="text-white">Lucro Primeiro {entity}</strong> exige que você retire o seu lucro antes de pagar os custos.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
         <div className="p-6 border-b border-dark-border">
            <h3 className="text-lg font-semibold">Últimas Transações ({entity})</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-surface">
                  <th className="p-4 text-sm text-slate-400 font-semibold border-b border-dark-border">Data</th>
                  <th className="p-4 text-sm text-slate-400 font-semibold border-b border-dark-border">Nome</th>
                  <th className="p-4 text-sm text-slate-400 font-semibold border-b border-dark-border">Categoria</th>
                  <th className="p-4 text-sm text-slate-400 font-semibold border-b border-dark-border text-right">Valor</th>
                  <th className="p-4 text-sm text-slate-400 font-semibold border-b border-dark-border text-center">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.sort((a,b) => b.date.localeCompare(a.date)).map(t => (
                  <tr key={t.id} className="hover:bg-dark-border/20 transition-colors">
                    <td className="p-4 border-b border-dark-border/50 text-slate-300">
                      {format(parseISO(t.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 border-b border-dark-border/50 font-medium">
                      {t.name}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-dark-border text-slate-400">{t.status}</span>
                    </td>
                    <td className="p-4 border-b border-dark-border/50 text-slate-400">
                       {store.categories.find(c => c.id === t.categoryId)?.name || 'Sem Categoria'}
                    </td>
                    <td className={`p-4 border-b border-dark-border/50 text-right font-bold ${t.type === 'Receita' ? 'text-profit-neon' : 'text-expense-crimson'}`}>
                      {t.type === 'Receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 border-b border-dark-border/50 text-center">
                       <button onClick={() => store.deleteTransaction(t.id)} className="text-slate-500 hover:text-expense-crimson transition-colors text-sm">
                         Remover
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredTxs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">Nenhuma transação encontrada neste período.</td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
