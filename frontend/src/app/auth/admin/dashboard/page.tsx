// src/app/admin/dashboard/page.tsx
"use client"; // Marca como Client Component para usar hooks de estado de UI

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Para redirecionamento real

// --- Componentes de Seção da Dashboard (para manter o código organizado) ---

// src/components/admin/RegisterQuotaSection.tsx
const RegisterQuotaSection: React.FC = () => {
  const [quantity, setQuantity] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAddQuota = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adicionar Cota (visual):', { quantity, value, description });
    setFeedback('Cota adicionada visualmente! (Requisição POST simulada)');
    // Em um cenário real, você faria a requisição POST para /api/v1/admin/cotas
    // e atualizaria o estado global do termômetro.
    setQuantity('');
    setValue('');
    setDescription('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Registrar Nova Cota</h2>
      <form onSubmit={handleAddQuota} className="space-y-4">
        <div>
          <label htmlFor="quotaQuantity" className="block text-gray-700 text-sm font-medium mb-2">
            Quantidade de Cotas
          </label>
          <input
            type="number"
            id="quotaQuantity"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Ex: 1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="quotaValue" className="block text-gray-700 text-sm font-medium mb-2">
            Valor por Cota (R$)
          </label>
          <input
            type="number"
            id="quotaValue"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Ex: 200.00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="quotaDescription" className="block text-gray-700 text-sm font-medium mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            id="quotaDescription"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Ex: Doação da Empresa X"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-md shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Adicionar Cota
        </button>
        {feedback && (
          <p className="text-sm text-center text-green-600 mt-2">{feedback}</p>
        )}
      </form>
    </div>
  );
};

// src/components/admin/ManageQuotasSection.tsx
const ManageQuotasSection: React.FC = () => {
  // Dados mockados para a tabela (apenas visual)
  const [quotas, setQuotas] = useState([
    { id: '1', quantity: 1, value: 200, description: 'Cota inicial', date: '2025-07-01' },
    { id: '2', quantity: 5, value: 200, description: 'Doação de grupo', date: '2025-07-02' },
    { id: '3', quantity: 2, value: 200, description: 'Venda de rifa', date: '2025-07-03' },
  ]);

  const handleDeleteQuota = (id: string) => {
    console.log('Deletar Cota (visual):', id);
    // Em um cenário real, você faria a requisição DELETE para /api/v1/admin/cotas/{id}
    // e depois filtraria a lista de cotas.
    setQuotas(quotas.filter(quota => quota.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Gerenciar Cotas Existentes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Quantidade</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Valor (R$)</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Data</th>
              <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {quotas.map((quota) => (
              <tr key={quota.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">{quota.quantity}</td>
                <td className="py-3 px-4 text-gray-800">{quota.value.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-800">{quota.description}</td>
                <td className="py-3 px-4 text-gray-800">{quota.date}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleDeleteQuota(quota.id)}
                    className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
            {quotas.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">Nenhuma cota registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Placeholder para Paginação */}
      <div className="flex justify-center mt-6 space-x-2">
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Anterior</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Próxima</button>
      </div>
    </div>
  );
};

// src/components/admin/UpdateGoalSection.tsx
const UpdateGoalSection: React.FC = () => {
  const [newGoalValue, setNewGoalValue] = useState('');
  const [newQuotaValue, setNewQuotaValue] = useState('');
  const [currentGoal, setCurrentGoal] = useState('R$ 1.200.000,00'); // Mocked current goal
  const [feedback, setFeedback] = useState('');

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Atualizar Meta (visual):', { newGoalValue, newQuotaValue });
    setFeedback('Meta atualizada visualmente! (Requisição PUT simulada)');
    // Em um cenário real, você faria a requisição PUT para /api/v1/admin/meta
    // e então buscaria o novo status do termômetro.
    setNewGoalValue('');
    setNewQuotaValue('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Atualizar Meta do Termômetro</h2>
      <p className="text-lg text-gray-700 mb-4">Meta Atual: <span className="font-bold text-teal-600">{currentGoal}</span></p>
      <form onSubmit={handleUpdateGoal} className="space-y-4">
        <div>
          <label htmlFor="newGoalValue" className="block text-gray-700 text-sm font-medium mb-2">
            Novo Valor Total da Meta (R$)
          </label>
          <input
            type="number"
            id="newGoalValue"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Ex: 1500000.00"
            value={newGoalValue}
            onChange={(e) => setNewGoalValue(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newQuotaValue" className="block text-gray-700 text-sm font-medium mb-2">
            Novo Valor Unitário da Cota Padrão (R$)
          </label>
          <input
            type="number"
            id="newQuotaValue"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Ex: 250.00"
            value={newQuotaValue}
            onChange={(e) => setNewQuotaValue(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-md shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Atualizar Meta
        </button>
        {feedback && (
          <p className="text-sm text-center text-green-600 mt-2">{feedback}</p>
        )}
      </form>
    </div>
  );
};

// src/components/admin/ControlsSection.tsx
const ControlsSection: React.FC = () => {
  const [resetMetaToo, setResetMetaToo] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleResetClick = () => {
    setConfirmationVisible(true);
  };

  const confirmReset = () => {
    console.log('Reiniciar Termômetro (visual). Resetar meta também?', resetMetaToo);
    setFeedback('Termômetro reiniciado visualmente! (Requisição POST simulada)');
    // Em um cenário real, você faria a requisição POST para /api/v1/admin/reset
    // com o payload { resetMetaTambem: resetMetaToo }
    setConfirmationVisible(false);
  };

  const cancelReset = () => {
    setConfirmationVisible(false);
    setFeedback('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Controles do Termômetro</h2>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="resetMetaToo"
          checked={resetMetaToo}
          onChange={(e) => setResetMetaToo(e.target.checked)}
          className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label htmlFor="resetMetaToo" className="ml-2 block text-gray-700 text-sm font-medium">
          Resetar Meta Também
        </label>
      </div>
      <button
        onClick={handleResetClick}
        className="w-full px-6 py-3 bg-white border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
      >
        Reiniciar Termômetro
      </button>

      {confirmationVisible && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
          <p className="text-yellow-800 mb-3">Tem certeza que deseja reiniciar o termômetro?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={confirmReset}
              className="px-5 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Sim, Reiniciar
            </button>
            <button
              onClick={cancelReset}
              className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {feedback && (
          <p className="text-sm text-center text-green-600 mt-2">{feedback}</p>
        )}
    </div>
  );
};


// --- Página Principal da Dashboard do Administrador ---

// src/app/admin/dashboard/page.tsx
const AdminDashboardPage: React.FC = () => {
  // Em um cenário real, você verificaria o token JWT aqui e redirecionaria
  // const router = useRouter();
  // React.useEffect(() => {
  //   const token = localStorage.getItem('adminToken');
  //   if (!token) {
  //     router.push('/admin/login');
  //   }
  // }, [router]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
          Painel de Administração
        </h1>

        {/* Layout de Grid para as Seções */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Seção 1: Registrar Nova Cota */}
          <RegisterQuotaSection />

          {/* Seção 2: Gerenciar Cotas Existentes */}
          <div className="md:col-span-2 lg:col-span-2"> {/* Esta seção pode ocupar mais espaço */}
            <ManageQuotasSection />
          </div>

          {/* Seção 3: Atualizar Meta do Termômetro */}
          <UpdateGoalSection />

          {/* Seção 4: Controles do Termômetro */}
          <ControlsSection />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
