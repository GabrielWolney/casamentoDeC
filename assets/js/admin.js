import { supabase } from './db.js';
import { PixPayload } from './pix-payload.js';

const CHAVE_NOIVOS = "000.000.000-00";
const NOME_NOIVO = "SEU NOME";
const CIDADE_NOIVO = "BRASILIA";

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnSalvar = document.getElementById('btnSalvar');
const tipoSelect = document.getElementById('tipoPagamento');

const toggleTela = (isLogged) => {
    if (loginSection) loginSection.classList.toggle('hidden', isLogged);
    if (adminSection) adminSection.classList.toggle('hidden', !isLogged);
};

const checkAuth = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        toggleTela(!!session);
    } catch (err) {
        console.error(err);
    }
};

if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        
        if (!emailInput || !passInput) return;

        const email = emailInput.value.trim();
        const password = passInput.value.trim();

        if (!email || !password) return alert("Preencha email e senha.");

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            await checkAuth();
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            await checkAuth();
        } catch (err) {
            console.error(err);
        }
    });
}

if (tipoSelect) {
    tipoSelect.addEventListener('change', (e) => {
        const tipo = e.target.value;
        const areaValor = document.getElementById('areaValor');
        const areaLinkMP = document.getElementById('areaLinkMP');

        if (areaValor) areaValor.classList.toggle('hidden', tipo === 'pix_livre');
        if (areaLinkMP) areaLinkMP.classList.toggle('hidden', tipo !== 'mp');
    });
}

if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
        const tituloEl = document.getElementById('titulo');
        const imagemEl = document.getElementById('imagem');
        const valorInput = document.getElementById('valor');
        const linkMpInput = document.getElementById('linkMp');

        if (!tituloEl || !imagemEl || !tipoSelect || !valorInput || !linkMpInput) return;

        const titulo = tituloEl.value.trim();
        const imagem = imagemEl.value.trim();
        const tipo = tipoSelect.value;
        const rawValor = parseFloat(valorInput.value);
        const linkMp = linkMpInput.value.trim();

        if (!titulo || !imagem) return alert("Preencha título e imagem!");

        let price = null;
        let payment_link = null;
        let is_custom = false;

        if (tipo === 'mp') {
            if (isNaN(rawValor) || rawValor <= 0) return alert("Defina um valor válido!");
            if (!linkMp) return alert("Cole o link do MP!");
            price = rawValor;
            payment_link = linkMp;
        } else if (tipo === 'pix_fixo') {
            if (isNaN(rawValor) || rawValor <= 0) return alert("Defina um valor válido!");
            price = rawValor;
            is_custom = true;
            try {
                const pix = new PixPayload(CHAVE_NOIVOS, NOME_NOIVO, CIDADE_NOIVO, 'PRESENTE', price);
                payment_link = pix.getPayload();
            } catch (e) {
                return alert("Erro ao gerar Pix.");
            }
        } else {
            is_custom = true;
            price = 0;
            payment_link = null;
        }

        const originalText = btnSalvar.innerText;
        btnSalvar.disabled = true;
        btnSalvar.innerText = "Salvando...";

        try {
            const { error } = await supabase.from('gifts').insert({
                title: titulo,
                price: price,
                image_url: imagem,
                payment_link: payment_link,
                is_custom: is_custom
            });

            if (error) throw error;

            alert("Salvo com sucesso!");
            tituloEl.value = '';
            imagemEl.value = '';
            valorInput.value = '';
            linkMpInput.value = '';
            
        } catch (err) {
            alert(`Erro: ${err.message}`);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = originalText;
        }
    });
}

checkAuth();