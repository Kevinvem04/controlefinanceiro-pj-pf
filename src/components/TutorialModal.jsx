import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function TutorialModal({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('finkev_tutorial_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('finkev_tutorial_seen', 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
        <button onClick={handleClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
           <X size={24} />
        </button>

        <div className="mb-6">
           <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">FK</span>
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Finkev</h2>
           <p className="text-slate-400 text-sm leading-relaxed">
             Para que o motor de análise das contas Pessoa Física e Pessoa Jurídica funcione em sincronia perfeita, siga estas regras de ouro:
           </p>
        </div>

        <div className="space-y-4 mb-8">
           <div className="flex gap-3 items-start">
             <CheckCircle className="text-profit-neon mt-0.5 shrink-0" size={18} />
             <p className="text-sm text-slate-300">
               <strong className="text-white block mb-0.5">Dinheiro sempre sai da PJ:</strong>
               Distribuição de lucros <b>sempre</b> nasce como uma Despesa na PJ. O sistema cuidará magicamente de espelhar isso como uma Receita de lucro na PF.
             </p>
           </div>
           <div className="flex gap-3 items-start">
             <CheckCircle className="text-active-blue mt-0.5 shrink-0" size={18} />
             <p className="text-sm text-slate-300">
               <strong className="text-white block mb-0.5">Sem repetições de transferências:</strong>
               Você só lança em um lado (Origem). O Finkev criará a cópia conectada no outro lado para os cálculos do seu dashboard de forma automática.
             </p>
           </div>
        </div>

        <button 
          onClick={handleClose}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all min-h-[44px]"
        >
          Excelente, vamos começar
        </button>
      </div>
    </div>,
    document.body
  );
}
