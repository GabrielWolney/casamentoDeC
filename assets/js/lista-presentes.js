import { supabase, CHAVE_PIX_DISPLAY, CHAVE_PIX_COPY } from './db.js';

// Seletores DOM
const container = document.getElementById('giftsContainer');
const modal = document.getElementById('paymentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const btnCopyPix = document.getElementById('btnCopyPix');

// Elementos internos do Modal
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const pixKeyDisplay = document.getElementById('pixKeyDisplay');
const whatsappLink = document.getElementById('whatsappLink');

// 1. Função Principal de Carregamento
async function init() {
    const { data: gifts, error } = await supabase.from('gifts').select('*');

    if (error) {
        container.innerHTML = '<p>Erro ao carregar presentes. Tente recarregar.</p>';
        console.error(error);
        return;
    }

    // Ordenação: Cota (Pix) primeiro, depois maior preço -> menor preço
    const cotas = gifts.filter(g => g.is_custom);
    const normais = gifts.filter(g => !g.is_custom).sort((a, b) => b.price - a.price);
    const listaFinal = [...cotas, ...normais];

    renderizarCards(listaFinal);
}

// 2. Cria o HTML dos cards dinamicamente
function renderizarCards(lista) {
    container.innerHTML = ''; // Limpa o "Carregando..."

    lista.forEach(gift => {
        // Cria o elemento div do card
        const card = document.createElement('div');
        card.className = 'glass-card';

        // Lógica de Preço
        const precoTexto = gift.is_custom ? 'Valor que desejar' : `R$ ${gift.price.toFixed(2).replace('.', ',')}`;

        // Preenche o HTML interno do card
        card.innerHTML = `
            <div class="gift-img-placeholder">
                ${gift.image_url ? `<img src="${gift.image_url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : ''}
            </div>
            <h3>${gift.title}</h3>
            <p class="gift-price">${precoTexto}</p>
        `;

        // Cria o botão via JS para adicionar o evento de click (sem sujar o HTML)
        const btn = document.createElement('button');
        btn.className = gift.is_custom ? 'btn-outline' : 'btn-primary';
        btn.innerText = gift.is_custom ? 'Enviar Pix' : 'Presentear';
        
        // ADICIONA O EVENTO DE CLICK AQUI
        btn.addEventListener('click', () => {
            if (gift.payment_link && !gift.is_custom) {
                // Se tiver link do Mercado Pago, abre direto
                window.open(gift.payment_link, '_blank');
            } else {
                // Se for Pix ou Cota, abre o modal
                abrirModal(gift);
            }
        });

        card.appendChild(btn);
        container.appendChild(card);
    });
}

// 3. Lógica do Modal
function abrirModal(gift) {
    modalTitle.innerText = gift.title;
    modalPrice.innerText = gift.is_custom ? "Valor à sua escolha" : `R$ ${gift.price.toFixed(2).replace('.', ',')}`;
    pixKeyDisplay.innerText = CHAVE_PIX_DISPLAY;
    
    // Configura botão do WhatsApp com mensagem pronta
    const msg = `Olá! Acabei de enviar um presente da lista: ${gift.title}. Segue o comprovante!`;
    whatsappLink.href = `https://wa.me/5561999999999?text=${encodeURIComponent(msg)}`; // TROQUE O NUMERO

    modal.classList.remove('hidden');
}

// Eventos do Modal (Fechar e Copiar)
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Fecha se clicar fora do modal
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

btnCopyPix.addEventListener('click', () => {
    navigator.clipboard.writeText(CHAVE_PIX_COPY)
        .then(() => alert('Chave Pix copiada!'))
        .catch(() => alert('Erro ao copiar chave.'));
});

// Inicia tudo
init();