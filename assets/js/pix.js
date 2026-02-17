// Dados simulados (Chave Pix)
const PIX_KEY = "000.000.000-00"; // Coloque sua chave aqui

function openGiftModal(itemName, itemPrice) {
    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('modalTitle');
    const price = document.getElementById('modalPrice');
    const pixDisplay = document.getElementById('pixKey');
    
    // Preenche os dados
    title.innerText = itemName;
    price.innerText = itemPrice > 0 ? `R$ ${itemPrice},00` : "Valor Livre";
    pixDisplay.innerText = PIX_KEY;
    
    // Atualiza Link do WhatsApp (Mensagem pronta)
    const msg = encodeURIComponent(`Olá! Acabei de enviar o presente: ${itemName}. Segue o comprovante!`);
    document.getElementById('whatsappLink').href = `https://wa.me/5561999999999?text=${msg}`; // Coloque seu número
    
    // Mostra Modal
    modal.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Fechar Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Copiar PIX
    const copyBtn = document.querySelector('.btn-copy');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copiado!";
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });
});