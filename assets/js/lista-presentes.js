import { supabase, CHAVE_PIX_NOIVOS, NOME_NOIVOS, CIDADE_NOIVOS } from './db.js';
import { PixPayload } from './pix-payload.js';

const IMGBB_API_KEY = "44dee0aaf082865f06be3f424c34cb23"; 

const trigger = document.getElementById('triggerAdmin');
const modalLogin = document.getElementById('modalLogin');
const modalAdmin = document.getElementById('modalAdmin');
const container = document.getElementById('giftsContainer');
const paymentModal = document.getElementById('paymentModal');

const giftTypeSelect = document.getElementById('giftType');
const fixedPriceFields = document.getElementById('fixedPriceFields');
const titleInput = document.getElementById('newTitle');
const priceInput = document.getElementById('newPrice');
const linkInput = document.getElementById('newLinkMP');
const fileInput = document.getElementById('newImageFile');
const statusMsg = document.getElementById('uploadStatus');
const currentImageMsg = document.getElementById('currentImageMsg');
const btnDelete = document.getElementById('btnDeleteGift');
const modalAdminTitle = document.getElementById('modalAdminTitle');

const customValueContainer = document.getElementById('customValueContainer');
const customValueInput = document.getElementById('customValueInput');
const modalPriceDisplay = document.getElementById('modalPriceDisplay');
const pixKeyDisplay = document.getElementById('pixKeyDisplay');

let isEditing = false;
let editingId = null;
let editingImageUrl = "";
let codigoPixAtual = ""; 

supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') carregarLista(); 
});

if (trigger) {
    trigger.addEventListener('click', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            resetAdminForm();
            modalAdmin.classList.remove('hidden');
        } else {
            modalLogin.classList.remove('hidden');
        }
    });
}

const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPass').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) alert("Erro: " + error.message);
        else {
            modalLogin.classList.add('hidden');
            resetAdminForm();
            modalAdmin.classList.remove('hidden');
        }
    });
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
        modalAdmin.classList.add('hidden');
    });
}

if(giftTypeSelect) {
    giftTypeSelect.addEventListener('change', (e) => {
        fixedPriceFields.style.display = e.target.value === 'custom' ? 'none' : 'block';
    });
}

const btnSaveGift = document.getElementById('btnSaveGift');
if (btnSaveGift) {
    btnSaveGift.addEventListener('click', async () => {
        const isCustom = giftTypeSelect.value === 'custom';
        const title = titleInput.value;
        const price = isCustom ? 0 : parseFloat(priceInput.value);
        const linkMP = isCustom ? null : linkInput.value;
        
        if (!title) return alert("Preencha o título!");
        if (!isCustom && (isNaN(price) || !linkMP)) return alert("Preencha preço e link para presentes fixos!");
        if (!isEditing && fileInput.files.length === 0) return alert("Selecione uma imagem!");

        btnSaveGift.disabled = true;
        btnSaveGift.innerText = "Processando...";

        try {
            let finalImageUrl = editingImageUrl;

            if (fileInput.files.length > 0) {
                statusMsg.innerText = "Enviando nova imagem...";
                statusMsg.style.color = "blue";
                
                const formData = new FormData();
                formData.append("image", fileInput.files[0]);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (!data.success) throw new Error("Erro ImgBB");
                finalImageUrl = data.data.url;
            }

            let pixCode = null;
            if (!isCustom) {
                statusMsg.innerText = "Atualizando Pix...";
                const pix = new PixPayload(CHAVE_PIX_NOIVOS, NOME_NOIVOS, CIDADE_NOIVOS, 'CASAMENTO', price);
                pixCode = pix.getPayload();
            }

            statusMsg.innerText = "Salvando no banco...";
            const payload = {
                title: title,
                price: price,
                image_url: finalImageUrl,
                payment_link_mp: linkMP,
                pix_code: pixCode,
                is_custom: isCustom
            };

            let error = null;
            if (isEditing) {
                const res = await supabase.from('gifts').update(payload).eq('id', editingId);
                error = res.error;
            } else {
                const res = await supabase.from('gifts').insert(payload);
                error = res.error;
            }

            if (error) throw error;

            alert(isEditing ? "Atualizado com sucesso!" : "Criado com sucesso!");
            modalAdmin.classList.add('hidden');
            carregarLista();

        } catch (err) {
            alert("Erro: " + err.message);
            statusMsg.innerText = "Erro ao salvar.";
            statusMsg.style.color = "red";
        } finally {
            btnSaveGift.disabled = false;
            btnSaveGift.innerText = "Salvar";
            statusMsg.innerText = "";
        }
    });
}

if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
        if (!isEditing || !editingId) return;
        if (confirm("Excluir este presente?")) {
            await supabase.from('gifts').delete().eq('id', editingId);
            modalAdmin.classList.add('hidden');
            carregarLista();
        }
    });
}

window.excluirDireto = async (id) => {
    if (confirm("Excluir este presente?")) {
        await supabase.from('gifts').delete().eq('id', id);
        carregarLista();
    }
}

async function carregarLista() {
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color: white;">Carregando...</p>';
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;

    const { data: gifts } = await supabase.from('gifts').select('*').order('created_at', { ascending: false });
    
    if(!gifts || gifts.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: white;">Nenhum presente ainda.</p>';
        return;
    }

    container.innerHTML = '';
    
    const cotas = gifts.filter(g => g.is_custom);
    const normais = gifts.filter(g => !g.is_custom).sort((a,b) => b.price - a.price);
    const listaFinal = [...cotas, ...normais];

    listaFinal.forEach(gift => {
        const card = document.createElement('div');
        card.className = 'glass-card'; 
        card.style.position = 'relative'; 
        
        let adminHtml = '';
        if (isAdmin) {
            adminHtml = `
                <div class="admin-controls">
                    <button class="btn-glass-icon edit" onclick="prepararEdicao('${gift.id}', '${gift.title}', ${gift.price}, '${gift.payment_link_mp}', '${gift.image_url}', ${gift.is_custom})"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-glass-icon delete" onclick="excluirDireto('${gift.id}')"><i class="ph ph-trash"></i></button>
                </div>`;
        }

        let buttonsHtml = '';
        let priceDisplay = gift.is_custom ? "Valor Livre" : `R$ ${gift.price.toFixed(2)}`;

        if (gift.is_custom) {
            buttonsHtml = `
                <button class="btn-outline" style="width:100%; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="abrirModalCota('${gift.title}')">
                    <i class="ph ph-coins"></i> Definir Valor
                </button>`;
        } else {
            buttonsHtml = `
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="${gift.payment_link_mp}" target="_blank" class="btn-primary" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px; text-decoration:none;">
                       <i class="ph ph-credit-card"></i> Cartão
                    </a>
                    <button class="btn-outline" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="abrirModalFixo('${gift.pix_code}', '${gift.title}', ${gift.price})">
                        <i class="ph ph-qr-code"></i> Pix
                    </button>
                </div>`;
        }

        card.innerHTML = `
            ${adminHtml}
            <div class="gift-img-placeholder">
                <img src="${gift.image_url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
            </div>
            <h3>${gift.title}</h3>
            <p class="gift-price">${priceDisplay}</p>
            ${buttonsHtml}
        `;
        container.appendChild(card);
    });
}

window.abrirModalFixo = (codigo, nome, preco) => {
    document.getElementById('modalTitle').innerText = nome;
    if(modalPriceDisplay) {
        modalPriceDisplay.innerText = `R$ ${preco.toFixed(2)}`;
        modalPriceDisplay.classList.remove('hidden');
    }
    if(customValueContainer) customValueContainer.classList.add('hidden');
    
    codigoPixAtual = codigo;
    if(pixKeyDisplay) pixKeyDisplay.innerText = codigo.substring(0, 30) + "...";
    if(paymentModal) paymentModal.classList.remove('hidden');
}

window.abrirModalCota = (nome) => {
    document.getElementById('modalTitle').innerText = nome;
    
    if(modalPriceDisplay) modalPriceDisplay.classList.add('hidden');
    
    if(customValueContainer) {
        customValueContainer.classList.remove('hidden');
        customValueContainer.style.display = 'block';
    }
    
    if(customValueInput) customValueInput.value = "";
    codigoPixAtual = "";
    if(pixKeyDisplay) pixKeyDisplay.innerText = "Digite um valor acima...";
    if(paymentModal) paymentModal.classList.remove('hidden');
    setTimeout(() => { if(customValueInput) customValueInput.focus() }, 100);
}

if(customValueInput) {
    customValueInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (val > 0) {
            const pix = new PixPayload(CHAVE_PIX_NOIVOS, NOME_NOIVOS, CIDADE_NOIVOS, 'COTA', val);
            codigoPixAtual = pix.getPayload();
            if(pixKeyDisplay) pixKeyDisplay.innerText = codigoPixAtual.substring(0, 30) + "... (Gerado)";
        } else {
            codigoPixAtual = "";
            if(pixKeyDisplay) pixKeyDisplay.innerText = "Aguardando valor...";
        }
    });
}

const btnCopyPix = document.getElementById('btnCopyPix');
if (btnCopyPix) {
    btnCopyPix.onclick = () => {
        if (!codigoPixAtual) return alert("Código inválido ou valor não definido!");
        navigator.clipboard.writeText(codigoPixAtual).then(() => {
            const originalText = btnCopyPix.innerHTML;
            btnCopyPix.innerHTML = '<i class="ph ph-check"></i> Copiado!';
            setTimeout(() => btnCopyPix.innerHTML = originalText, 2000);
        });
    };
}

function resetAdminForm() {
    isEditing = false;
    editingId = null;
    editingImageUrl = "";
    
    if(modalAdminTitle) modalAdminTitle.innerText = "Novo Presente";
    if(giftTypeSelect) {
        giftTypeSelect.value = 'fixed';
        giftTypeSelect.dispatchEvent(new Event('change'));
    }

    if(titleInput) titleInput.value = "";
    if(priceInput) priceInput.value = "";
    if(linkInput) linkInput.value = "";
    if(fileInput) fileInput.value = "";
    if(currentImageMsg) currentImageMsg.innerText = "";
    if(btnDelete) btnDelete.style.display = "none"; 
}

window.prepararEdicao = (id, title, price, link, imgUrl, isCustom) => {
    isEditing = true;
    editingId = id;
    editingImageUrl = imgUrl;

    if(modalAdminTitle) modalAdminTitle.innerText = "Editar Presente";
    
    if(giftTypeSelect) {
        giftTypeSelect.value = isCustom ? 'custom' : 'fixed';
        giftTypeSelect.dispatchEvent(new Event('change')); 
    }

    if(titleInput) titleInput.value = title;
    if(priceInput) priceInput.value = isCustom ? "" : price;
    if(linkInput) linkInput.value = link === 'null' ? "" : link;
    if(fileInput) fileInput.value = ""; 

    if(currentImageMsg) currentImageMsg.innerText = "Imagem mantida. Selecione outra apenas para trocar.";
    if(btnDelete) btnDelete.style.display = "block"; 

    if(modalAdmin) modalAdmin.classList.remove('hidden');
}

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = () => {
        if(modalAdmin) modalAdmin.classList.add('hidden');
        if(modalLogin) modalLogin.classList.add('hidden');
        if(paymentModal) paymentModal.classList.add('hidden');
    }
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay')) event.target.classList.add('hidden');
});

carregarLista();