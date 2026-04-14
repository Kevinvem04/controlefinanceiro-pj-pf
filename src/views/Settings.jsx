import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function Settings({ store }) {
  const [newCat, setNewCat] = useState({ name: '', entity: 'PJ', type: 'Despesa' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCat.name.trim() === '') return;
    store.addCategory(newCat);
    setNewCat({ ...newCat, name: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="glass-card p-6 border-l-4 border-l-active-blue">
         <h2 className="text-xl font-bold mb-2">Editor de Categorias</h2>
         <p className="text-slate-400 text-sm">Gerencie o plano de contas da sua Empresa (PJ) e do seu Orçamento Pessoal (PF). Separe rigidamente onde cada despesa aloca seu capital.</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-8">
        
        {/* Adicionar */}
        <div className="glass-card p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Adicionar Nova</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
               <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Nome da Categoria</label>
               <input 
                 type="text" 
                 value={newCat.name} 
                 onChange={e => setNewCat({...newCat, name: e.target.value})}
                 className="w-full bg-dark-bg border border-dark-border rounded-md p-2 outline-none focus:border-active-blue text-base min-h-[44px]" 
               />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Entidade</label>
                 <select 
                   value={newCat.entity} 
                   onChange={e => setNewCat({...newCat, entity: e.target.value})}
                   className="w-full bg-dark-bg border border-dark-border rounded-md p-2 outline-none focus:border-active-blue text-base min-h-[44px]" 
                 >
                   <option value="PJ">PJ (Empresa)</option>
                   <option value="PF">PF (Pessoal)</option>
                 </select>
              </div>
              <div className="flex-1">
                 <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Tipo Primário</label>
                 <select 
                   value={newCat.type} 
                   onChange={e => setNewCat({...newCat, type: e.target.value})}
                   className="w-full bg-dark-bg border border-dark-border rounded-md p-2 outline-none focus:border-active-blue text-base min-h-[44px]" 
                 >
                   <option value="Despesa">Despesa</option>
                   <option value="Receita">Receita</option>
                 </select>
              </div>
            </div>
            <button className="w-full bg-active-blue hover:bg-active-hover text-white py-2 rounded-md transition-colors mt-6 text-base min-h-[44px] font-bold">
              Gravar Categoria
            </button>
          </form>
        </div>

        {/* Listar */}
        <div className="space-y-6">
           <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Categorias PJ (Empresa)</h3>
              <ul className="space-y-2">
                {store.categories.filter(c => c.entity === 'PJ').map(c => (
                  <li key={c.id} className="flex justify-between items-center bg-dark-bg p-2 rounded border border-dark-border">
                    <div>
                      <span className="text-sm text-slate-200">{c.name}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.type === 'Receita' ? 'bg-profit-neon/10 text-profit-neon' : 'bg-expense-crimson/10 text-expense-crimson'}`}>
                        {c.type}
                      </span>
                    </div>
                    <button onClick={() => store.deleteCategory(c.id)} className="text-slate-500 hover:text-expense-crimson min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"><Trash2 size={16}/></button>
                  </li>
                ))}
              </ul>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">Categorias PF (Pessoal)</h3>
              <ul className="space-y-2">
                {store.categories.filter(c => c.entity === 'PF').map(c => (
                  <li key={c.id} className="flex justify-between items-center bg-dark-bg p-2 rounded border border-dark-border">
                    <div>
                      <span className="text-sm text-slate-200">{c.name}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.type === 'Receita' ? 'bg-profit-neon/10 text-profit-neon' : 'bg-expense-crimson/10 text-expense-crimson'}`}>
                        {c.type}
                      </span>
                    </div>
                    <button onClick={() => store.deleteCategory(c.id)} className="text-slate-500 hover:text-expense-crimson min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"><Trash2 size={16}/></button>
                  </li>
                ))}
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
