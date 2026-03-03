// src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Users, Search, MapPin, Save, XCircle, Newspaper, Send, Trash2, Edit3, Bold, Heading2, Link as LinkIcon, Image as ImageIcon, CornerDownLeft } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  nickname?: string;
}

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  type: string;
  label: string;
  description: string | null;
  status: string;
  author: { name: string; email: string; } | null;
}

interface NoticiaData {
  id: string;
  title: string;
  contentHtml: string;
  sourceUrl?: string;
  publishedAt: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading, token } = useAuth();
  
  // Estados de Dados
  const [users, setUsers] = useState<UserData[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [noticias, setNoticias] = useState<NoticiaData[]>([]);
  
  // Estados de UI/Busca
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [markerSearchTerm, setMarkerSearchTerm] = useState('');
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);
  const [newLabel, setNewLabel] = useState('');

  // Estados de Notícias (Criação/Edição)
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSourceUrl, setNewsSourceUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Referência para a caixa de texto
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, [token]);

  // --- BUSCA DE DADOS ---
  const fetchNoticias = useCallback(async () => {
    try {
      const response = await fetch(`${window.location.origin}/newsapi/noticias`);
      if (response.ok) setNoticias(await response.json());
    } catch (error) { console.error("Erro notícias:", error); }
  }, []);

  const fetchMarkers = useCallback(async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/markers`, { headers: getAuthHeaders() });
      if (response.ok) setMarkers(await response.json());
    } catch (error) { console.error("Erro marcadores:", error); }
  }, [getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/users`, { headers: getAuthHeaders() });
      if (response.ok) setUsers(await response.json());
    } catch (error) { console.error("Erro usuários:", error); }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!isLoading && user?.isAdmin && token) {
        fetchMarkers();
        fetchUsers();
        fetchNoticias();
    }
  }, [isLoading, token, user, fetchMarkers, fetchUsers, fetchNoticias]);

  // --- TOOLBAR NATIVO (AJUSTADO PARA ABRAÇAR O TEXTO E USAR 'CLASS' EM VEZ DE 'CLASSNAME') ---
  const insertAtCursor = (startTag: string, endTag: string = '') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);

    const newText = before + startTag + selected + endTag + after;
    setNewsContent(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + startTag.length + selected.length;
      textarea.focus();
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt("Cole a URL (Link) aqui:");
    if (url) insertAtCursor(`<a href="${url}" target="_blank" class="text-accent-gold underline">`, `</a>`);
  };

  const handleInsertImage = () => {
    const url = prompt("Cole a URL da Imagem aqui:");
    if (url) insertAtCursor(`<img src="${url}" class="w-full rounded-lg my-4" />`);
  };

  // --- LÓGICA DE NOTÍCIAS ---
  const handleCreateOrUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return alert("Título e conteúdo obrigatórios");
    
    setIsPublishing(true);
    const method = editingNewsId ? 'PATCH' : 'POST';
    const url = editingNewsId 
      ? `${window.location.origin}/newsapi/noticias/${editingNewsId}` 
      : `${window.location.origin}/newsapi/noticias`;

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newsTitle, contentHtml: newsContent, sourceUrl: newsSourceUrl }),
      });

      if (res.ok) {
        alert(editingNewsId ? "Notícia atualizada!" : "Notícia publicada!");
        setEditingNewsId(null);
        setNewsTitle(''); setNewsContent(''); setNewsSourceUrl('');
        fetchNoticias();
      }
    } catch (err) { alert("Erro na operação"); }
    finally { setIsPublishing(false); }
  };

  const handleStartEditNews = (n: NoticiaData) => {
    setEditingNewsId(n.id);
    setNewsTitle(n.title);
    setNewsContent(n.contentHtml);
    setNewsSourceUrl(n.sourceUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("Deseja realmente apagar esta notícia?")) return;
    try {
      const res = await fetch(`${window.location.origin}/newsapi/noticias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setNoticias(prev => prev.filter(n => n.id !== id));
        alert("Notícia removida!");
      }
    } catch (err) { alert("Erro ao deletar"); }
  };

  // --- LÓGICA DE MARCADORES ---
  const handleUpdateLabel = async () => {
    if (!editingMarker || !token) return;
    try {
      const res = await fetch(`${window.location.origin}/api/markers/${editingMarker.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ label: newLabel }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMarkers(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        setEditingMarker(null);
      }
    } catch (error) { console.error(error); }
  };

  if (isLoading) return <Layout><div className="p-20 text-center text-accent-gold">Carregando...</div></Layout>;
  if (!user?.isAdmin) return <Navigate to="/" replace />;

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
  const filteredMarkers = markers.filter(m => m.label.toLowerCase().includes(markerSearchTerm.toLowerCase()) || m.type.toLowerCase().includes(markerSearchTerm.toLowerCase()));

  return (
    <Layout>
      <Helmet><title>Painel Admin | Chrono Odyssey</title></Helmet>
      <main className="container mx-auto max-w-7xl py-12 px-4 space-y-12">
        
        {/* SEÇÃO 1: NOTÍCIAS (PUBLICAÇÃO E GESTÃO) */}
        <section className="bg-dark-card-bg border border-dark-border rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-text-white flex items-center gap-2">
              <Newspaper className="text-accent-gold" /> {editingNewsId ? 'Editar Notícia' : 'Publicar Notícia'}
            </h2>
            <div className="text-xs text-gray-400 bg-black/40 p-3 rounded border border-dark-border">
              Selecione o texto e clique nos botões abaixo para formatar automaticamente.
            </div>
          </div>

          <form onSubmit={handleCreateOrUpdateNews} className="space-y-4 mb-10 pb-10 border-b border-dark-divider">
            <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Título da Notícia" className="w-full bg-dark-background border border-dark-border text-white p-2 rounded focus:ring-1 focus:ring-accent-gold outline-none" />
            
            {/* TOOLBAR NATIVO */}
            <div className="flex flex-wrap gap-2 bg-black/30 p-2 rounded border border-dark-border">
              <button type="button" onClick={() => insertAtCursor('<strong class="text-accent-gold">', '</strong>')} className="flex items-center gap-1 px-3 py-1.5 bg-dark-background hover:bg-dark-divider text-white rounded text-sm transition-colors" title="Negrito Dourado">
                <Bold size={16} /> Negrito
              </button>
              <button type="button" onClick={() => insertAtCursor('<h2 class="text-accent-gold font-bold text-xl mt-6 mb-4">', '</h2>')} className="flex items-center gap-1 px-3 py-1.5 bg-dark-background hover:bg-dark-divider text-white rounded text-sm transition-colors" title="Subtítulo">
                <Heading2 size={16} /> Subtítulo
              </button>
              <button type="button" onClick={handleInsertLink} className="flex items-center gap-1 px-3 py-1.5 bg-dark-background hover:bg-dark-divider text-white rounded text-sm transition-colors" title="Inserir Link Oculto">
                <LinkIcon size={16} /> Link
              </button>
              <button type="button" onClick={handleInsertImage} className="flex items-center gap-1 px-3 py-1.5 bg-dark-background hover:bg-dark-divider text-white rounded text-sm transition-colors" title="Inserir Imagem">
                <ImageIcon size={16} /> Imagem
              </button>
              <div className="w-px h-6 bg-dark-divider mx-1 self-center"></div>
              {/* Ajuste no Botão de Parágrafo */}
              <button type="button" onClick={() => insertAtCursor('<p>', '</p>')} className="flex items-center gap-1 px-3 py-1.5 bg-dark-background hover:bg-dark-divider text-white rounded text-sm transition-colors" title="Envolver com Parágrafo">
                <CornerDownLeft size={16} /> Parágrafo
              </button>
            </div>

            <textarea 
              ref={textAreaRef}
              value={newsContent} 
              onChange={e => setNewsContent(e.target.value)} 
              placeholder="Escreva sua notícia aqui..." 
              rows={12} 
              className="w-full bg-dark-background border border-dark-border text-white p-4 rounded font-mono text-sm focus:ring-1 focus:ring-accent-gold outline-none" 
            />

            <input type="text" value={newsSourceUrl} onChange={e => setNewsSourceUrl(e.target.value)} placeholder="URL da Fonte (Opcional)" className="w-full bg-dark-background border border-dark-border text-white p-2 rounded focus:ring-1 focus:ring-accent-gold outline-none" />
            
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPublishing} className="bg-accent-gold text-dark-background px-6 py-2 rounded font-bold hover:bg-white transition-colors flex items-center gap-2">
                <Send size={18} /> {isPublishing ? "Processando..." : (editingNewsId ? "Salvar Alterações" : "Publicar Notícia")}
              </button>
              {editingNewsId && (
                <button type="button" onClick={() => { setEditingNewsId(null); setNewsTitle(''); setNewsContent(''); setNewsSourceUrl(''); }} className="text-gray-400 hover:text-white underline text-sm">
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>

          {/* TABELA DE GESTÃO DE NOTÍCIAS */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-medium mb-4 text-accent-gold">Notícias Publicadas</h3>
            <table className="w-full text-left">
              <thead className="border-b border-dark-border text-gray-500 text-sm">
                <tr>
                  <th className="p-2">Título</th>
                  <th className="p-2">Data</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {noticias.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nenhuma notícia para gerir.</td></tr>
                ) : (
                  noticias.map(n => (
                    <tr key={n.id} className="border-b border-dark-divider hover:bg-black/20 transition-colors">
                      <td className="p-2 max-w-[300px] truncate font-medium text-gray-300">{n.title}</td>
                      <td className="p-2 text-gray-500">{new Date(n.publishedAt).toLocaleDateString()}</td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-4">
                          <button onClick={() => handleStartEditNews(n)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <Edit3 size={14} /> Editar
                          </button>
                          <button onClick={() => handleDeleteNews(n.id)} className="text-red-500 hover:text-red-400 flex items-center gap-1">
                            <Trash2 size={14} /> Apagar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEÇÃO 2: MARCADORES */}
        <section className="bg-dark-card-bg border border-dark-border rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-text-white mb-4 flex items-center gap-2"><MapPin /> Gerir Marcadores</h2>
          <div className="relative mb-4">
            <input type="text" placeholder="Procurar marcador..." value={markerSearchTerm} onChange={e => setMarkerSearchTerm(e.target.value)} className="w-full bg-dark-background border border-dark-border text-white p-2 pl-10 rounded focus:ring-1 focus:ring-accent-gold outline-none" />
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="border-b border-dark-border text-gray-400">
                <tr><th className="p-3">ID</th><th className="p-3">Label</th><th className="p-3">Tipo</th><th className="p-3">Status</th><th className="p-3">Ações</th></tr>
              </thead>
              <tbody>
                {filteredMarkers.map(m => (
                  <tr key={m.id} className="border-b border-dark-divider hover:bg-black/20">
                    <td className="p-3 text-sm font-mono text-gray-500">{m.id}</td>
                    <td className="p-3">{editingMarker?.id === m.id ? <input value={newLabel} onChange={e => setNewLabel(e.target.value)} className="bg-dark-background border border-accent-gold p-1 rounded text-white" /> : m.label}</td>
                    <td className="p-3 text-sm text-gray-400">{m.type}</td>
                    <td className="p-3"><span className="text-[10px] bg-black/40 px-2 py-1 rounded border border-dark-border text-gray-300 uppercase tracking-wider">{m.status}</span></td>
                    <td className="p-3">
                      {editingMarker?.id === m.id ? 
                        <div className="flex gap-2"><button onClick={handleUpdateLabel} className="text-green-500"><Save size={18}/></button><button onClick={() => setEditingMarker(null)} className="text-red-400"><XCircle size={18}/></button></div> : 
                        <button onClick={() => { setEditingMarker(m); setNewLabel(m.label); }} className="text-accent-gold text-sm hover:underline">Editar Label</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEÇÃO 3: UTILIZADORES */}
        <section className="bg-dark-card-bg border border-dark-border rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-text-white mb-4 flex items-center gap-2"><Users /> Gerir Utilizadores</h2>
          <div className="relative mb-4">
            <input type="text" placeholder="Procurar utilizador..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="w-full bg-dark-background border border-dark-border text-white p-2 pl-10 rounded focus:ring-1 focus:ring-accent-gold outline-none" />
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="border-b border-dark-border text-gray-400">
                <tr><th className="p-3">Nome</th><th className="p-3">Email</th><th className="p-3">Estado</th><th className="p-3">Ações</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-dark-divider hover:bg-black/20">
                    <td className="p-3 flex items-center gap-2"><img src={u.picture || `https://i.pravatar.cc/40?u=${u.email}`} className="w-6 h-6 rounded-full" /> {u.name}</td>
                    <td className="p-3 text-sm text-gray-400">{u.email}</td>
                    <td className="p-3 text-xs">{u.isPremium ? '⭐ Premium' : 'Padrão'} {u.isAdmin && '| Admin'}</td>
                    <td className="p-3"><Link to={`/admin/user/${u.id}`} className="text-accent-gold text-sm hover:underline">Editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </Layout>
  );
};

export default AdminDashboardPage;