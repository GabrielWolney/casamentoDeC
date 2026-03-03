import { supabase } from './db.js';
const IMGBB_API_KEY = "44dee0aaf082865f06be3f424c34cb23";
const triggerAdmin = document.getElementById('triggerAdmin');
const modalLogin = document.getElementById('modalLogin');
const modalHistoria = document.getElementById('modalHistoria');
const modalUploadInfo = document.getElementById('modalUploadInfo');
const historiaText = document.getElementById('historiaText');
const historiaImg = document.getElementById('historiaImg');
const historiaImgPlaceholder = document.getElementById('historiaImgPlaceholder');
const galleryContainer = document.getElementById('galleryContainer');
const adminHistoryBtn = document.getElementById('adminHistoryBtn');
const adminHistoryImgBtn = document.getElementById('adminHistoryImgBtn');
const adminGalleryBtn = document.getElementById('adminGalleryBtn');
let uploadTarget = ""; 
supabase.auth.onAuthStateChange((event, session) => {
    const isAdmin = !!session;
    if (adminHistoryBtn) adminHistoryBtn.classList.toggle('hidden', !isAdmin);
    if (adminHistoryImgBtn) adminHistoryImgBtn.classList.toggle('hidden', !isAdmin);
    if (adminGalleryBtn) adminGalleryBtn.classList.toggle('hidden', !isAdmin);
    carregarHome(isAdmin);
});
if (triggerAdmin) {
    triggerAdmin.addEventListener('click', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            modalLogin.classList.remove('hidden');
        } else {
            const querSair = confirm("Você já está logado como Administrador!\n\nOs botões de edição (lápis, câmera e '+ Adicionar Foto') já devem estar visíveis nos cards.\n\nDeseja sair da sua conta?");
            if (querSair) {
                await supabase.auth.signOut();
                alert("Você saiu da área de administração.");
                window.location.reload(); 
            }
        }
    });
}
document.getElementById('btnLogin')?.addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) alert("Erro: " + error.message);
    else modalLogin.classList.add('hidden');
});
window.fecharModais = () => {
    modalLogin?.classList.add('hidden');
    modalHistoria?.classList.add('hidden');
    modalUploadInfo?.classList.add('hidden');
};
async function carregarHome(isAdmin) {
    const { data: info } = await supabase.from('home_info').select('*').eq('id', 1).single();
    if (info) {
        if (historiaText) historiaText.innerText = info.texto_historia || "Escreva sua história aqui...";
        if (info.imagem_historia && historiaImg) {
            historiaImg.src = info.imagem_historia;
            historiaImg.style.display = 'block';
            historiaImgPlaceholder.style.display = 'none';
        }
    }
    if (galleryContainer) {
        galleryContainer.innerHTML = '<p>Carregando galeria...</p>';
        const { data: galeria } = await supabase.from('galeria').select('*').order('created_at', { ascending: false });
        galleryContainer.innerHTML = '';
        if (!galeria || galeria.length === 0) {
            galleryContainer.innerHTML = '<p>Nenhuma foto adicionada ainda.</p>';
            return;
        }
        galeria.forEach(foto => {
            const card = document.createElement('div');
            card.className = 'glass-card carousel-item';
            card.style.padding = '10px';
            card.style.position = 'relative';
            let deleteBtn = isAdmin ? `<button class="btn-glass-icon delete" style="position: absolute; top: 15px; right: 15px; z-index: 10;" onclick="excluirFoto('${foto.id}')"><i class="ph ph-trash"></i></button>` : '';
            card.innerHTML = `
                ${deleteBtn}
                <img src="${foto.image_url}" loading="lazy" decoding="async" style="width: 100%; height: 250px; object-fit: cover; border-radius: 16px;">
            `;
            galleryContainer.appendChild(card);
        });
    }
}
window.abrirModalHistoria = () => {
    document.getElementById('editHistoriaText').value = historiaText.innerText;
    modalHistoria.classList.remove('hidden');
};
window.abrirModalHistoriaImg = () => {
    uploadTarget = 'historia';
    document.getElementById('uploadTitle').innerText = 'Imagem da História';
    document.getElementById('uploadFile').value = '';
    document.getElementById('uploadStatus').innerText = '';
    modalUploadInfo.classList.remove('hidden');
};
window.abrirModalGaleria = () => {
    uploadTarget = 'galeria';
    document.getElementById('uploadTitle').innerText = 'Adicionar à Galeria';
    document.getElementById('uploadFile').value = '';
    document.getElementById('uploadStatus').innerText = '';
    modalUploadInfo.classList.remove('hidden');
};
window.excluirFoto = async (id) => {
    if (confirm("Excluir esta foto da galeria?")) {
        await supabase.from('galeria').delete().eq('id', id);
        carregarHome(true);
    }
};
document.getElementById('btnSaveHistoria')?.addEventListener('click', async () => {
    const texto = document.getElementById('editHistoriaText').value;
    const btn = document.getElementById('btnSaveHistoria');
    btn.innerText = "Salvando...";
    await supabase.from('home_info').update({ texto_historia: texto }).eq('id', 1);
    btn.innerText = "Salvar Texto";
    modalHistoria.classList.add('hidden');
    carregarHome(true);
});
const comprimirImagem = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Mantém a proporção se a imagem for muito larga
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converte para WEBP com 80% de qualidade
                canvas.toBlob((blob) => {
                    resolve(new File([blob], "imagem_comprimida.webp", {
                        type: "image/webp",
                        lastModified: Date.now()
                    }));
                }, 'image/webp', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// Upload de Imagens (História ou Galeria) com Compressão
document.getElementById('btnSaveUpload')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('uploadFile');
    if (fileInput.files.length === 0) return alert("Selecione uma imagem!");
    
    const statusMsg = document.getElementById('uploadStatus');
    const btn = document.getElementById('btnSaveUpload');
    btn.disabled = true;
    
    try {
        statusMsg.innerText = "Comprimindo imagem (otimizando peso)...";
        const arquivoOriginal = fileInput.files[0];
        
        // Passa o arquivo original no nosso compressor
        const arquivoComprimido = await comprimirImagem(arquivoOriginal);
        
        statusMsg.innerText = "Enviando para ImgBB...";
        const formData = new FormData();
        formData.append("image", arquivoComprimido);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const data = await response.json();
        if (!data.success) throw new Error("Erro ImgBB");
        
        const imageUrl = data.data.url;
        statusMsg.innerText = "Salvando no banco...";

        if (uploadTarget === 'historia') {
            await supabase.from('home_info').update({ imagem_historia: imageUrl }).eq('id', 1);
        } else if (uploadTarget === 'galeria') {
            await supabase.from('galeria').insert({ image_url: imageUrl });
        }

        alert("Imagem adicionada e otimizada com sucesso!");
        fecharModais();
        carregarHome(true);

    } catch (err) {
        alert("Erro: " + err.message);
    } finally {
        btn.disabled = false;
        statusMsg.innerText = "";
    }
});
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay')) event.target.classList.add('hidden');
});