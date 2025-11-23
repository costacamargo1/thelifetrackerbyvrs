import React, { useState, useEffect } from 'react';
import { Gasto, Receita, Assinatura, Cartao, Category, Objetivo, TipoPagamento, Periodo, TipoAssinatura, StatusObj, CategoryType } from '../pages/types';
import { toNum, fmt, detectarCategoria, SUGESTOES_BANCOS } from '../../utils/helpers';
import { X } from 'lucide-react';

// --- GENERIC FORM COMPONENTS ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{props.label}</label>
    <input 
      {...props}
      className={`w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${props.className}`} 
    />
  </div>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{props.label}</label>
    <select 
      {...props}
      className={`w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${props.className}`}
    >
      {props.children}
    </select>
  </div>
);

const Button = ({ children, onClick, type = 'button', primary = false }: { children: React.ReactNode, onClick?: () => void, type?: 'button' | 'submit' | 'reset', primary?: boolean }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition ${primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
  >
    {children}
  </button>
);


// --- MODAL PROPS ---

interface ModalProps {
  type: 'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo';
  closeModal: () => void;
  onSaveGasto: (gasto: Gasto) => void;
  onSaveReceita: (receita: Receita) => void;
  onSaveAssinatura: (assinatura: Assinatura) => void;
  onSaveCartao: (cartao: Cartao) => void;
  onSaveCategoria: (categoria: Category) => void;
  onSaveObjetivo: (objetivo: Objetivo) => void;
  itemToEdit?: any;
  cartoes: Cartao[];
  categorias: Category[];
}

// --- FORM COMPONENTS ---

const GastoForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveGasto, itemToEdit, cartoes, categorias }) => {
  const [gasto, setGasto] = useState<Partial<Gasto>>(itemToEdit || { data: new Date().toISOString().split('T')[0] });
  const [isCategoryManuallyChanged, setIsCategoryManuallyChanged] = useState(false);

  useEffect(() => {
    if (itemToEdit?.categoria) {
      setIsCategoryManuallyChanged(true);
    }
  }, [itemToEdit]);

  useEffect(() => {
    // Reset cartaoId and parcelasTotal if tipoPagamento is not CRÉDITO
    if (gasto.tipoPagamento && gasto.tipoPagamento !== 'CRÉDITO') {
      setGasto(prev => ({
        ...prev,
        cartaoId: undefined, // or null, depending on how you want to represent it
        parcelasTotal: undefined, // or null
      }));
    }
  }, [gasto.tipoPagamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cartaoId') {
      setGasto(prev => ({ ...prev, cartaoId: value ? Number(value) : undefined }));
      return;
    }
    
    if (name === 'descricao' && !isCategoryManuallyChanged) {
      const suggestedCategory = detectarCategoria(value);
      setGasto(prev => ({
        ...prev,
        descricao: value,
        categoria: suggestedCategory
      }));
    } else if (name === 'categoria') {
      if (value) { // only set manual change if user selects a valid category
        setIsCategoryManuallyChanged(true);
      }
      setGasto(prev => ({ ...prev, [name]: value }));
    }
    else {
      setGasto(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving gasto:', gasto);
    onSaveGasto(gasto as Gasto);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Gasto</h2>
      <Input label="Descrição" name="descricao" value={gasto.descricao || ''} onChange={handleChange} required autoFocus />
      <Input label="Valor" name="valor" type="number" step="0.01" value={gasto.valor || ''} onChange={handleChange} required />
      <Select label="Tipo de Pagamento" name="tipoPagamento" value={gasto.tipoPagamento || ''} onChange={handleChange} required>
        <option value="">Selecione o tipo de pagamento</option>
        <option value="DÉBITO">Débito/Dinheiro</option>
        <option value="CRÉDITO">Crédito</option>
      </Select>
      {gasto.tipoPagamento === 'CRÉDITO' && (
        <>
          <Select label="Cartão" name="cartaoId" value={gasto.cartaoId || ''} onChange={handleChange} required>
            <option value="">Selecione um cartão</option>
            {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Input label="Parcelas" name="parcelasTotal" type="number" min="1" value={gasto.parcelasTotal || 1} onChange={handleChange} />
        </>
      )}
      <Select label="Categoria" name="categoria" value={gasto.categoria || ''} onChange={handleChange} required>
        <option value="">Selecione uma categoria</option>
        {categorias.filter(c => c.type === 'despesa').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </Select>
      <Input label="Data" name="data" type="date" value={gasto.data || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const ReceitaForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveReceita, itemToEdit }) => {
  const [receita, setReceita] = useState<Partial<Receita>>(itemToEdit || { data: new Date().toISOString().split('T')[0] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReceita(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReceita(receita as Receita);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Receita</h2>
      <Input label="Descrição" name="descricao" value={receita.descricao || ''} onChange={handleChange} required />
      <Input label="Valor" name="valor" type="number" step="0.01" value={receita.valor || ''} onChange={handleChange} required />
      <Input label="Data" name="data" type="date" value={receita.data || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const AssinaturaForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveAssinatura, itemToEdit, cartoes }) => {
  const [assinatura, setAssinatura] = useState<Partial<Assinatura>>(itemToEdit || { tipo: 'ASSINATURA', periodoCobranca: 'MENSAL', tipoPagamento: 'CRÉDITO' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cartaoId') {
      setAssinatura(prev => ({ ...prev, cartaoId: value ? Number(value) : undefined }));
    } else {
      setAssinatura(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAssinatura(assinatura as Assinatura);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Conta Recorrente</h2>
      <Input label="Nome" name="nome" value={assinatura.nome || ''} onChange={handleChange} required />
      <Input label="Valor" name="valor" type="number" step="0.01" value={assinatura.valor || ''} onChange={handleChange} required />
      <Input label="Dia da Cobrança" name="diaCobranca" type="number" min="1" max="31" value={assinatura.diaCobranca || ''} onChange={handleChange} required />
      <Select label="Tipo" name="tipo" value={assinatura.tipo} onChange={handleChange}>
        {(['ASSINATURA', 'CONTRATO - ALUGUEL', 'CONTRATO - PERSONALIZADO', 'ACORDO'] as TipoAssinatura[]).map(t => <option key={t} value={t}>{t}</option>)}
      </Select>
      <Select label="Período" name="periodoCobranca" value={assinatura.periodoCobranca} onChange={handleChange}>
        <option value="MENSAL">Mensal</option>
        <option value="ANUAL">Anual</option>
      </Select>
      <Select label="Forma de Pagamento" name="tipoPagamento" value={assinatura.tipoPagamento} onChange={handleChange}>
        <option value="CRÉDITO">Crédito</option>
        <option value="DÉBITO">Débito</option>
      </Select>
      {assinatura.tipoPagamento === 'CRÉDITO' && (
        <Select label="Cartão" name="cartaoId" value={assinatura.cartaoId || ''} onChange={handleChange}>
          <option value="">Nenhum</option>
          {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      )}
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const CartaoForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveCartao, itemToEdit }) => {
  const [cartao, setCartao] = useState<Partial<Cartao>>(itemToEdit || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCartao(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (name: string) => {
    setCartao(prev => ({ ...prev, nome: name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCartao(cartao as Cartao);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Cartão</h2>
      <Input label="Nome do Cartão" name="nome" value={cartao.nome || ''} onChange={handleChange} required autoFocus />
      
      {!itemToEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Sugestões</label>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_BANCOS.map(banco => (
              <button
                key={banco}
                type="button"
                onClick={() => handleSuggestionClick(banco)}
                className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {banco}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input label="Limite" name="limite" type="number" step="0.01" value={cartao.limite || ''} onChange={handleChange} required />
      <Input label="Dia do Vencimento" name="diaVencimento" type="number" min="1" max="31" value={cartao.diaVencimento || ''} onChange={handleChange} required />
      <Input label="Dia do Fechamento" name="diaFechamento" type="number" min="1" max="31" value={cartao.diaFechamento || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const CategoriaForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveCategoria, itemToEdit }) => {
  const [categoria, setCategoria] = useState<Partial<Category>>(itemToEdit || { type: 'despesa' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoria(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCategoria(categoria as Category);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Categoria</h2>
      <Input label="Nome" name="name" value={categoria.name || ''} onChange={handleChange} required />
      <Input label="Ícone (Lucide)" name="icon" value={categoria.icon || ''} onChange={handleChange} required />
      <Select label="Tipo" name="type" value={categoria.type || 'despesa'} onChange={handleChange}>
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </Select>
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const ObjetivoForm: React.FC<Omit<ModalProps, 'type'>> = ({ closeModal, onSaveObjetivo, itemToEdit }) => {
  const [objetivo, setObjetivo] = useState<Partial<Objetivo>>(itemToEdit || { valorAtual: 0, status: 'EM PROGRESSO' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setObjetivo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveObjetivo(objetivo as Objetivo);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Objetivo</h2>
      <Input label="Nome" name="nome" value={objetivo.nome || ''} onChange={handleChange} required />
      <Input label="Valor Necessário" name="valorNecessario" type="number" step="0.01" value={objetivo.valorNecessario || ''} onChange={handleChange} required />
      <Input label="Valor Atual" name="valorAtual" type="number" step="0.01" value={objetivo.valorAtual || 0} onChange={handleChange} required />
      <Select label="Status" name="status" value={objetivo.status || 'EM PROGRESSO'} onChange={handleChange}>
        {(['IMEDIATO', 'EM PROGRESSO', 'DISTANTE', 'QUITADO - EM PROGRESSO', 'QUITADO - FINALIZADO'] as StatusObj[]).map(s => <option key={s} value={s}>{s}</option>)}
      </Select>
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};


// --- MAIN MODAL COMPONENT ---

const Modal: React.FC<ModalProps> = (props) => {
  const { type, closeModal } = props;

  const renderForm = () => {
    switch (type) {
      case 'gasto':
        return <GastoForm {...props} />;
      case 'receita':
        return <ReceitaForm {...props} />;
      case 'assinatura':
        return <AssinaturaForm {...props} />;
      case 'cartao':
        return <CartaoForm {...props} />;
      case 'categoria':
        return <CategoriaForm {...props} />;
      case 'objetivo':
        return <ObjetivoForm {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full m-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={24} />
        </button>
        {renderForm()}
      </div>
    </div>
  );
};

export default Modal;
