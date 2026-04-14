import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

export function useFinanceStore(user) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      setIsLoaded(false);
      return;
    }

    async function loadData() {
      // Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*');
        
      if (catErr) console.error("Error loading categories:", catErr);

      let finalCats = catData || [];

      // SEED INICIAL (Primeiro Acesso)
      if (finalCats.length === 0 && !catErr) {
          const INITIAL_CATEGORIES = [
            { id: uuidv4(), name: 'Faturação Coprodução', entity: 'PJ', type: 'Receita', user_id: user.id },
            { id: uuidv4(), name: 'Taxas de Gateway', entity: 'PJ', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Tráfego Pago', entity: 'PJ', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Impostos', entity: 'PJ', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Distribuição de Lucros (Saída)', entity: 'PJ', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Distribuição de Lucros (Entrada)', entity: 'PF', type: 'Receita', user_id: user.id },
            { id: uuidv4(), name: 'Habitação', entity: 'PF', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Alimentação', entity: 'PF', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Saúde', entity: 'PF', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Lazer', entity: 'PF', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Aporte de Capital (Saída)', entity: 'PF', type: 'Despesa', user_id: user.id },
            { id: uuidv4(), name: 'Aporte de Capital (Entrada)', entity: 'PJ', type: 'Receita', user_id: user.id }
          ];
          
          const { error: seedErr } = await supabase.from('categories').insert(INITIAL_CATEGORIES);
          if (seedErr) {
             console.error("Failed to seed INITIAL_CATEGORIES:", seedErr);
          } else {
             finalCats = INITIAL_CATEGORIES;
          }
      }

      // Fetch Transactions
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*');

      if (txErr) {
          console.error("Error loading transactions:", txErr);
          alert("Erro de RLS na Leitura de Transações: " + txErr.message);
      }

      setCategories(finalCats);
      setTransactions(txData || []);
      setIsLoaded(true);
    }

    loadData();
  }, [user]);

  // Actions wrapped in useCallback to prevent unneeded re-renders
  const addTransaction = useCallback(async (tx) => {
    if (!user) return;
    const newId = uuidv4();
    const newTx = { ...tx, id: newId, user_id: user.id };
    
    let linkedTx = null;
    let inserts = [newTx];
    
    // Auto Transfer Logic
    if (newTx.entity === 'PJ' && newTx.type === 'Despesa') {
       const catObj = categories.find(c => c.id === newTx.categoryId);
       if (catObj && catObj.name.includes('Distribuição de Lucros')) {
           const pfIncomeCat = categories.find(c => c.entity === 'PF' && c.type === 'Receita' && c.name.includes('Distribuição de Lucros'));
           if (pfIncomeCat) {
               newTx.isTransfer = true; 
               linkedTx = {
                   id: uuidv4(),
                   name: `Recebimento reflexo: ${newTx.name}`,
                   amount: newTx.amount,
                   date: newTx.date,
                   entity: 'PF',
                   type: 'Receita',
                   categoryId: pfIncomeCat.id,
                   status: newTx.status,
                   linkedFromId: newId,
                   isTransfer: true,
                   user_id: user.id
               };
           }
       }
    }
    
    if (newTx.entity === 'PF' && newTx.type === 'Receita') {
       const catObj = categories.find(c => c.id === newTx.categoryId);
       if (catObj && catObj.name.includes('Distribuição de Lucros')) {
           const pjExpenseCat = categories.find(c => c.entity === 'PJ' && c.type === 'Despesa' && c.name.includes('Distribuição de Lucros'));
           if (pjExpenseCat) {
               newTx.isTransfer = true;
               linkedTx = {
                   id: uuidv4(),
                   name: `Saída reflexa: ${newTx.name}`,
                   amount: newTx.amount,
                   date: newTx.date,
                   entity: 'PJ',
                   type: 'Despesa',
                   categoryId: pjExpenseCat.id,
                   status: newTx.status,
                   linkedFromId: newId,
                   isTransfer: true,
                   user_id: user.id
               };
           }
       }
    }
    
    if (newTx.entity === 'PF' && newTx.type === 'Despesa') {
       const catObj = categories.find(c => c.id === newTx.categoryId);
       if (catObj && catObj.name.toLowerCase().includes('aporte')) {
           const pjIncomeCat = categories.find(c => c.entity === 'PJ' && c.type === 'Receita' && c.name.toLowerCase().includes('aporte'));
           if (pjIncomeCat) {
               newTx.isTransfer = true; 
               linkedTx = {
                   id: uuidv4(),
                   name: `Aporte Recebido: ${newTx.name}`,
                   amount: newTx.amount,
                   date: newTx.date,
                   entity: 'PJ',
                   type: 'Receita',
                   categoryId: pjIncomeCat.id,
                   status: newTx.status,
                   linkedFromId: newId,
                   isTransfer: true,
                   user_id: user.id
               };
           }
       }
    }

    if (newTx.entity === 'PJ' && newTx.type === 'Receita') {
       const catObj = categories.find(c => c.id === newTx.categoryId);
       if (catObj && catObj.name.toLowerCase().includes('aporte')) {
           const pfExpenseCat = categories.find(c => c.entity === 'PF' && c.type === 'Despesa' && c.name.toLowerCase().includes('aporte'));
           if (pfExpenseCat) {
               newTx.isTransfer = true;
               linkedTx = {
                   id: uuidv4(),
                   name: `Aporte reflexo: ${newTx.name}`,
                   amount: newTx.amount,
                   date: newTx.date,
                   entity: 'PF',
                   type: 'Despesa',
                   categoryId: pfExpenseCat.id,
                   status: newTx.status,
                   linkedFromId: newId,
                   isTransfer: true,
                   user_id: user.id
               };
           }
       }
    }

    if (linkedTx) inserts.push(linkedTx);

    setTransactions(prev => [...prev, ...inserts]);

    const { error } = await supabase.from('transactions').insert(inserts);
    if (error) {
       console.error("Failed to insert tx:", error);
       alert("Erro ao gravar no banco: " + error.message + " | Detalhes: " + JSON.stringify(error.details));
    }
  }, [user, categories]);

  const updateTransaction = useCallback(async (id, updated) => {
    if (!user) return;
    
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    
    const { error } = await supabase
      .from('transactions')
      .update(updated)
      .eq('id', id);
      
    if (error) console.error("Failed to update tx:", error);
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error("Failed to delete tx:", error);
  }, [user]);

  const addCategory = useCallback(async (cat) => {
    if (!user) return;
    const newCat = { ...cat, id: uuidv4(), user_id: user.id };

    setCategories(prev => [...prev, newCat]);

    const { error } = await supabase.from('categories').insert([newCat]);
    if (error) console.error("Failed to add category:", error);
  }, [user]);

  const deleteCategory = useCallback(async (id) => {
     if (!user) return;

     setCategories(prev => prev.filter(c => c.id !== id));
     
     const { error } = await supabase.from('categories').delete().eq('id', id);
     if (error) console.error("Failed to delete cat:", error);
  }, [user]);

  return {
    transactions,
    categories,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory
  };
}
