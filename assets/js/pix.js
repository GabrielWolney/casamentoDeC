const PIX_KEY = "000.000.000-00";

window.openGiftModal = (itemName, itemPrice) => {
    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('modalTitle');
    const price = document.getElementById('modalPrice');
    const pixDisplay = document.getElementById('pixKey');
    const whatsappLink = document.getElementById('whatsappLink');
    
    if (!modal || !title || !price || !pixDisplay || !whatsappLink) return;

    title.innerText = itemName;
    price.innerText = itemPrice > 0 ? `R$ ${itemPrice.toFixed(2)}` : "Valor Livre";
    pixDisplay.innerText = PIX_KEY;
    
    const msg = encodeURIComponent(`Olá! Acabei de enviar o presente: ${itemName}. Segue o comprovante!`);
    whatsappLink.href = `https://wa.me/5561999999999?text=${msg}`;
    
    modal.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-modal');
    const copyBtn = document.querySelector('.btn-copy');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(PIX_KEY);
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "Copiado!";
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            } catch (err) {
                console.error(err);
            }
        });
    }
});