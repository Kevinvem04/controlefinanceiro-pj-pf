import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';

export default function FAB({ store }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    entity: 'PJ',
    type: 'Despesa',
    categoryId: '',
    status: 'Pago'
  });

  const availableCategories = store.categories.filter(c => c.entity === formData.entity && c.type === formData.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    store.addTransaction({
      ...formData,
      amount: Number(formData.amount)
    });
    setIsOpen(false);
    setFormData({ ...formData, name: '', amount: '' });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-8 right-8 w-14 h-14 bg-profit-neon hover:bg-profit-hover text-dark-bg rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-110 z-50"
      >
        <Plus size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 md:bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100]">
          <div className="bg-dark-surface md:border border-dark-border p-6 md:p-8 w-full md:w-[450px] md:max-w-md h-[90vh] md:h-auto md:min-h-0 md:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h2 className="text-xl font-semibold">Nova Transação</h2>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 min-h-[44px] flex items-center justify-center -mr-2"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <select 
                  value={formData.entity}
                  onChange={e => setFormData({...formData, entity: e.target.value, categoryId: ''})}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                >
                  <option value="PJ">Empresa (PJ)</option>
                  <option value="PF">Pessoal (PF)</option>
                </select>

                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value, categoryId: ''})}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                >
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
              </div>

              <div>
                <input 
                  type="text" 
                  required
                  placeholder="Descrição da Transação"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                />
              </div>

              <div className="flex gap-4">
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-1/2 bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-profit-neon font-bold text-base min-h-[44px]"
                />
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-1/2 bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                />
              </div>

              <div>
                <select 
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                >
                  <option value="" disabled>Selecione a Categoria</option>
                  {availableCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 outline-none focus:border-active-blue text-base min-h-[44px]"
                >
                  <option value="Pago">Pago/Efetivado</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <button type="submit" className="w-full py-4 bg-active-blue hover:bg-active-hover text-white rounded-lg font-semibold transition-colors mt-auto min-h-[56px] text-base">
                Salvar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
