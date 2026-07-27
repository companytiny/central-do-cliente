const SUPABASE_URL = 'https://zngweeftriqnqpcdbyap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ3dlZWZ0cmlxbnFwY2RieWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODQzNjksImV4cCI6MjA5OTM2MDM2OX0.JOqT31lQnZuHRSOtD_8oVNaIBX86gsWuoD7I00hve5E';

// Inicia o cliente Supabase apenas se ele já foi carregado via CDN na página (login, postagens, criativos)
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Inicializa a variável global mockDatabase que será alimentada pelo banco real
window.mockDatabase = [];

// Função para buscar dados reais
window.fetchRealData = async () => {
    if (!window.supabaseClient) return [];
    
    // Obter o usuário logado
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) return [];
    
    // Buscar o nome da empresa na tabela profiles
    try {
        const { data: profileData } = await window.supabaseClient
            .from('profiles')
            .select('company_name')
            .eq('id', session.user.id)
            .single();
            
        if (profileData && profileData.company_name) {
            window.currentClientName = profileData.company_name;
        } else {
            window.currentClientName = "Nome não cadastrado";
        }
    } catch(e) {
        window.currentClientName = "Nome não cadastrado";
        console.error("[DEBUG] Erro ao buscar profile:", e);
    }
    
    // Buscar conteúdos desse usuário
    const { data: conteudos, error } = await window.supabaseClient
        .from('conteudos')
        .select('*')
        .order('data_postagem', { ascending: true });
        
    console.log("🔎 [DEBUG] Buscando dados no Supabase...");
    console.log("👤 [DEBUG] Usuário logado (ID):", session.user.id);
    console.log("📦 [DEBUG] Dados retornados pelo banco (RLS):", conteudos);
        
    if (error) {
        console.error("❌ [DEBUG] Erro ao buscar conteúdos:", error);
        return [];
    }
    
    // Mapear os dados do banco para o formato esperado pelo front-end (mockDatabase)
    const formattedData = conteudos.map(c => {
        // Função helper para transformar string separada por vírgula ou JSON array em Array normal
        const parseLinks = (raw) => {
            if (!raw) return [];
            try {
                if (typeof raw === 'string' && raw.trim().startsWith('[')) {
                    return JSON.parse(raw);
                }
            } catch(e) { console.error("Erro no parse de links JSON:", e); }
            if (typeof raw === 'string') {
                return raw.split(/[,\n\r]+/).map(l => l.trim()).filter(l => l);
            }
            if (Array.isArray(raw)) return raw;
            return [];
        };

        const postagemUrls = parseLinks(c.link_postagem);
        const criativoUrls = parseLinks(c.link_criativo);
        // Fallback antigo caso links_arquivos venha
        const fallbackUrls = parseLinks(c.links_arquivos);
        
        let isoDate = c.data_postagem || '';
        if (isoDate.includes('/')) {
            const parts = isoDate.split('/');
            if (parts.length === 3) {
                isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        
        return {
            id: c.id_ummense, // string identifier
            titulo: c.titulo,
            data: isoDate,
            status: c.status_cliente || '⏳ PENDENTE',
            etapa: c.etapa_aprovacao || '', // Mapeando a coluna exata da Ummense
            tag: c.tag,
            texto_descritivo: c.texto_descritivo,
            texto_briefing: c.legenda_postagem || c.texto_descritivo,
            texto_criativo: c.legenda_criativo || c.texto_descritivo,
            legenda_postagem: c.legenda_postagem,
            legenda_criativo: c.legenda_criativo,
            url_postagem: postagemUrls.length > 0 ? postagemUrls : fallbackUrls, // Array
            url_criativo: criativoUrls.length > 0 ? criativoUrls : fallbackUrls, // Array
            historico_alteracao: c.historico_alteracao,
            ajuste_briefing: c.ajuste_briefing,
            ajuste_postagem: c.ajuste_postagem,
            ajuste_criativo: c.ajuste_criativo,
            resposta_interna: c.resposta_interna
        };
    });
    
    window.mockDatabase = formattedData;
    return formattedData;
};

// Logout helper
window.logOut = async () => {
    if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    }
};
