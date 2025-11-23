import React, { useState, useEffect } from 'react';
import { Gasto, Receita, Assinatura, Cartao, Categoria, Objetivo, TipoPagamento, Periodo, TipoAssinatura, StatusObj, CategoryType } from '../pages/types';
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
  onSave: (type: string, item: any) => Promise<void>;
  itemToEdit?: any;
  cartoes: Cartao[];
  categorias: Categoria[];
}

interface FormProps extends Omit<ModalProps, 'type'> {
    type: 'gasto' | 'receita' | 'assinatura' | 'cartao' | 'categoria' | 'objetivo';
}

// --- FORM COMPONENTS ---

const GastoForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, cartoes, categorias, type }) => {
  const [gasto, setGasto] = useState<Partial<Gasto>>(itemToEdit || { data: new Date().toISOString().split('T')[0], metodo_pagamento: 'DÉBITO' });
  const [isCategoryManuallyChanged, setIsCategoryManuallyChanged] = useState(false);

  useEffect(() => {
    if (itemToEdit?.categoria) {
      setIsCategoryManuallyChanged(true);
    }
  }, [itemToEdit]);

  useEffect(() => {
    if (gasto.metodo_pagamento !== 'CRÉDITO') {
      setGasto(prev => ({ ...prev, cartaoId: null, parcelasTotal: 1 }));
    }
  }, [gasto.metodo_pagamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['valor', 'parcelasTotal', 'cartaoId'].includes(name);

    if (name === 'descricao' && !isCategoryManuallyChanged) {
      const suggestedCategory = detectarCategoria(value);
      setGasto(prev => ({ ...prev, descricao: value, categoria: suggestedCategory }));
    } else if (name === 'categoria' && value) {
      setIsCategoryManuallyChanged(true);
      setGasto(prev => ({ ...prev, [name]: value }));
    } else {
      setGasto(prev => ({ ...prev, [name]: isNumeric ? toNum(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, gasto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Gasto</h2>
      <Input label="Descrição" name="descricao" value={gasto.descricao || ''} onChange={handleChange} required autoFocus />
      <Input label="Valor" name="valor" type="number" step="0.01" value={gasto.valor || ''} onChange={handleChange} required />
      <Select label="Tipo de Pagamento" name="metodo_pagamento" value={gasto.metodo_pagamento || ''} onChange={handleChange} required>
        <option value="DÉBITO">Débito/Dinheiro</option>
        <option value="CRÉDITO">Crédito</option>
      </Select>
      {gasto.metodo_pagamento === 'CRÉDITO' && (
        <>
          <Select label="Cartão" name="cartaoId" value={gasto.cartaoId || ''} onChange={handleChange} required>
            <option value="">Selecione um cartão</option>
            {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          {/* Lógica de parcelamento foi removida do modal, será tratada no backend ou em camada de serviço se necessário */}
        </>
      )}
      <Select label="Categoria" name="categoria" value={gasto.categoria || ''} onChange={handleChange} required>
        <option value="">Selecione uma categoria</option>
        {categorias.filter(c => c.tipo === 'gasto').map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
      </Select>
      <Input label="Data" name="data" type="date" value={gasto.data || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const ReceitaForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, type, categorias }) => {
  const [receita, setReceita] = useState<Partial<Receita>>(itemToEdit || { data: new Date().toISOString().split('T')[0] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['valor'].includes(name);
    setReceita(prev => ({ ...prev, [name]: isNumeric ? toNum(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, receita);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Receita</h2>
      <Input label="Descrição" name="descricao" value={receita.descricao || ''} onChange={handleChange} required />
      <Input label="Valor" name="valor" type="number" step="0.01" value={receita.valor || ''} onChange={handleChange} required />
      <Input label="Origem" name="origem" value={receita.origem || ''} onChange={handleChange} />
       <Select label="Categoria" name="categoria" value={receita.categoria || ''} onChange={handleChange} required>
        <option value="">Selecione uma categoria</option>
        {categorias.filter(c => c.tipo === 'receita').map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
      </Select>
      <Input label="Data" name="data" type="date" value={receita.data || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const AssinaturaForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, type }) => {
  const [assinatura, setAssinatura] = useState<Partial<Assinatura>>(itemToEdit || { ciclo: 'MENSAL', proximo_pagamento: new Date().toISOString().split('T')[0] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['valor'].includes(name);
    setAssinatura(prev => ({ ...prev, [name]: isNumeric ? toNum(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, assinatura);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Conta Recorrente</h2>
      <Input label="Nome" name="nome" value={assinatura.nome || ''} onChange={handleChange} required />
      <Input label="Valor" name="valor" type="number" step="0.01" value={assinatura.valor || ''} onChange={handleChange} required />
      <Input label="Próximo Pagamento" name="proximo_pagamento" type="date" value={assinatura.proximo_pagamento || ''} onChange={handleChange} required />
      <Select label="Ciclo" name="ciclo" value={assinatura.ciclo} onChange={handleChange}>
        <option value="MENSAL">Mensal</option>
        <option value="ANUAL">Anual</option>
      </Select>
      <Input label="Categoria" name="categoria" value={assinatura.categoria || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const CartaoForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, type }) => {
  const [cartao, setCartao] = useState<Partial<Cartao>>(itemToEdit || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['limite', 'vencimento', 'fechamento'].includes(name);
    setCartao(prev => ({ ...prev, [name]: isNumeric ? toNum(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, cartao);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Cartão</h2>
      <Input label="Nome do Cartão" name="nome" value={cartao.nome || ''} onChange={handleChange} required autoFocus list="sugestoes-banco" />
      <datalist id="sugestoes-banco">
        {SUGESTOES_BANCOS.map(b => <option key={b} value={b} />)}
      </datalist>
      <Input label="Bandeira" name="bandeira" value={cartao.bandeira || ''} onChange={handleChange} required />
      <Input label="Limite" name="limite" type="number" step="100" value={cartao.limite || ''} onChange={handleChange} required />
      <Input label="Dia do Vencimento" name="vencimento" type="number" min="1" max="31" value={cartao.vencimento || ''} onChange={handleChange} required />
      <Input label="Dia do Fechamento" name="fechamento" type="number" min="1" max="31" value={cartao.fechamento || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const CategoriaForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, type }) => {
  const [categoria, setCategoria] = useState<Partial<Categoria>>(itemToEdit || { tipo: 'gasto' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoria(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, categoria);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Nova'} Categoria</h2>
      <Input label="Nome" name="nome" value={categoria.nome || ''} onChange={handleChange} required />
      <Input label="Ícone (Lucide)" name="icone" value={categoria.icone || ''} onChange={handleChange} required />
      <Select label="Tipo" name="tipo" value={categoria.tipo || 'gasto'} onChange={handleChange}>
        <option value="gasto">Gasto</option>
        <option value="receita">Receita</option>
      </Select>
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type="submit" primary>Salvar</Button>
      </div>
    </form>
  );
};

const ObjetivoForm: React.FC<FormProps> = ({ closeModal, onSave, itemToEdit, type }) => {
  const [objetivo, setObjetivo] = useState<Partial<Objetivo>>(itemToEdit || { valor_atual: 0, status: 'EM PROGRESSO' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['valor_total', 'valor_atual'].includes(name);
    setObjetivo(prev => ({ ...prev, [name]: isNumeric ? toNum(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, objetivo);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Novo'} Objetivo</h2>
      <Input label="Título" name="titulo" value={objetivo.titulo || ''} onChange={handleChange} required />
      <Input label="Descrição" name="descricao" value={objetivo.descricao || ''} onChange={handleChange} />
      <Input label="Valor Total" name="valor_total" type="number" step="0.01" value={objetivo.valor_total || ''} onChange={handleChange} required />
      <Input label="Valor Atual" name="valor_atual" type="number" step="0.01" value={objetivo.valor_atual || 0} onChange={handleChange} required />
      <Input label="Prazo" name="prazo" type="date" value={objetivo.prazo || ''} onChange={handleChange} />
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
    const formProps = { ...props, type }; // Adiciona o 'type' para os forms
    switch (type) {
      case 'gasto':
        return <GastoForm {...formProps} />;
      case 'receita':
        return <ReceitaForm {...formProps} />;
      case 'assinatura':
        return <AssinaturaForm {...formProps} />;
      case 'cartao':
        return <CartaoForm {...formProps} />;
      case 'categoria':
        return <CategoriaForm {...formProps} />;
      case 'objetivo':
        return <ObjetivoForm {...formProps} />;
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
