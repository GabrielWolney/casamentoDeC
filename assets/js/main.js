document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. NAVBAR 
    // =========================================
    const navbar = document.getElementById('mainNav');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // =========================================
    // 2. CRONÔMETRO 
    // =========================================
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        // Data: 4 de Julho de 2026 (Mês 6, pois Jan=0)
        const weddingDate = new Date(2026, 6, 4, 16, 0, 0).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const gap = weddingDate - now;

            if (gap < 0) {
                countdownEl.innerHTML = `
                    <div class="countdown-container">
                        <span class="time-number" style="font-size:2rem">Chegou o Grande Dia!</span>
                    </div>`;
                return;
            }

            const days = Math.floor(gap / (1000 * 60 * 60 * 24));
            const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            countdownEl.innerHTML = `
                <div class="countdown-container">
                    <div class="time-box">
                        <span class="time-number">${days}</span>
                        <span class="time-label">Dias</span>
                    </div>
                    <div class="time-box">
                        <span class="time-number">${hours}</span>
                        <span class="time-label">Horas</span>
                    </div>
                </div>
            `;
        };
        setInterval(updateTimer, 1000);
        updateTimer();
    }

    // =========================================
    // 3. RSVP INTELIGENTE 
    // =========================================
    const rsvpForm = document.getElementById('rsvpForm');
    const input = document.getElementById('guestName');
    const listContainer = document.getElementById('guestList');
    
    // *** IMPORTANTE: COLE SEU LINK DO APPS SCRIPT AQUI ***
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrsdUK6pVUkZvx4Zs6nckV4LOBu8tpw990FG9c94HZ-hB9DD22sFIMsHDiE5Bi6rHfKg/exec';
    
    let guestDatabase = []; // Armazena a lista de convidados

    // --- FUNÇÃO AUXILIAR DE NORMALIZAÇÃO ---
    // Remove acentos e deixa minúsculo (Ex: "João" -> "joao")
    const normalizeText = (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    };

    // A. Carregar lista ao abrir a página
    if (input) {
        fetch(SCRIPT_URL)
            .then(response => response.json())
            .then(data => {
                guestDatabase = data; 
                console.log('Lista carregada:', guestDatabase.length, 'convidados pendentes.');
            })
            .catch(err => console.error('Erro ao carregar lista:', err));
    }

    // B. Autocomplete (Enquanto digita)
    if (input) {
        input.addEventListener('input', function() {
            const val = this.value;
            listContainer.innerHTML = ''; 
            
            if (!val || val.length < 2) {
                listContainer.style.display = 'none';
                return;
            }

            // Filtra ignorando acentos e maiúsculas
            const matches = guestDatabase.filter(name => 
                normalizeText(name).includes(normalizeText(val))
            );

            if (matches.length > 0) {
                listContainer.style.display = 'block';
                
                matches.forEach(name => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerText = name; // Mostra o nome bonito original
                    
                    item.addEventListener('click', function() {
                        input.value = name; 
                        listContainer.style.display = 'none'; 
                    });
                    
                    listContainer.appendChild(item);
                });
            } else {
                listContainer.style.display = 'none';
            }
        });

        // Esconde lista ao clicar fora
        document.addEventListener('click', function(e) {
            if (e.target !== input) {
                listContainer.style.display = 'none';
            }
        });
    }

    // C. Enviar Confirmação
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = input.value;

            if (!name) { alert('Por favor, digite seu nome.'); return; }

            // Validação de Segurança: O nome existe na lista (normalizado)?
            const dbName = guestDatabase.find(guest => 
                normalizeText(guest) === normalizeText(name)
            );
            
            if (!dbName) {
                alert('Nome não encontrado na lista ou já confirmado. Tente selecionar da lista enquanto digita.');
                return;
            }

            const btn = rsvpForm.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Confirmando...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('nome', dbName); // Envia o nome correto do banco

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        alert(`Presença confirmada! Obrigado, ${dbName}.`);
                        rsvpForm.reset();
                        btn.innerText = 'Confirmado!';
                        
                        // Remove da lista local para não confirmar de novo
                        guestDatabase = guestDatabase.filter(g => g !== dbName);
                    } else {
                        alert('Erro: ' + (data.message || 'Tente novamente.'));
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro de conexão.');
                })
                .finally(() => {
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }
});