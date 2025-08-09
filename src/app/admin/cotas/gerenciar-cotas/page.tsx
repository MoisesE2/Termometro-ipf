"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CotaCard from "@/components/cotas/CotaCard";
import CotaSearch from "@/components/cotas/CotaSearch";
import CotaForm from "@/components/cotas/CotaForm";
import { Cota } from "@/models/Cota";
import { buildApiUrl } from "@/lib/api";

export default function GerenciarCotasPage() {
  const router = useRouter();
  const [cotas, setCotas] = useState<Cota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState<Cota | null>(null);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        // Verificar se o token é válido
        const response = await fetch(buildApiUrl('/api/auth/verify'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          router.push('/auth/login');
          return;
        }

        // Carregar cotas
        await loadCotas();
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        localStorage.removeItem('adminToken');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadCotas = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(buildApiUrl('/api/cotas/relatorio'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Acesso negado. Verifique suas permissões de administrador.');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar cotas');
      }

      const data = await response.json();
      setCotas(data.cotas || []);
    } catch (error) {
      console.error('Erro ao carregar cotas:', error);
      setError('Erro ao carregar cotas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(buildApiUrl(`/api/cotas/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCotas(prev => prev.filter(c => c.id !== id));
      } else {
        setError('Erro ao deletar cota');
      }
    } catch (error) {
      console.error('Erro ao deletar cota:', error);
      setError('Erro ao deletar cota');
    }
  };

  const handleEdit = (cota: Cota) => {
    setEditando(cota);
  };

  const handleUpdate = async (cotaAtualizada: Cota) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(buildApiUrl(`/api/cotas/${cotaAtualizada.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cotaAtualizada)
      });

      if (response.ok) {
        setCotas(prev =>
          prev.map(c => (c.id === cotaAtualizada.id ? cotaAtualizada : c))
        );
        setEditando(null);
      } else {
        setError('Erro ao atualizar cota');
      }
    } catch (error) {
      console.error('Erro ao atualizar cota:', error);
      setError('Erro ao atualizar cota');
    }
  };

  const cotasFiltradas = cotas.filter((c) =>
    c.responsavel?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-12 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold text-[#1F5830] mb-6">Gerenciar Cotas</h1>

      <CotaSearch search={search} setSearch={setSearch} />

      {editando && (
        <CotaForm
          initialData={editando}
          onCancel={() => setEditando(null)}
          onSubmit={handleUpdate}
        />
      )}

      {cotasFiltradas.map((cota) => (
        <CotaCard
          key={cota.id}
          cota={cota}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      {cotasFiltradas.length === 0 && (
        <p className="text-center text-gray-500 mt-8">Nenhuma cota encontrada.</p>
      )}
    </main>
  );
}
