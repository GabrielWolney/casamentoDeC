document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const weddingDate = new Date(2026, 6, 4, 16, 0, 0).getTime();

        // Construindo a DOM do relógio apenas 1 vez (Performance/Evitando DOM Thrashing)
        const separator = `<div style="width: 1px; height: 30px; background: rgba(26, 38, 52, 0.1); align-self: center; margin: 0 5px;"></div>`;
        countdownEl.innerHTML = `
            <div class="countdown-container" style="display: flex; justify-content: center; align-items: center; gap: 8px;">
                <div class="time-box" style="padding: 0 10px; min-width: 55px;">
                    <span id="cd-days" class="time-number" style="font-size: 2.2rem; display: block; font-variant-numeric: tabular-nums;">00</span>
                    <span class="time-label" style="font-size: 0.65rem; letter-spacing: 1px;">Dias</span>
                </div>
                ${separator}
                <div class="time-box" style="padding: 0 10px; min-width: 55px;">
                    <span id="cd-hours" class="time-number" style="font-size: 2.2rem; display: block; font-variant-numeric: tabular-nums;">00</span>
                    <span class="time-label" style="font-size: 0.65rem; letter-spacing: 1px;">Horas</span>
                </div>
                ${separator}
                <div class="time-box" style="padding: 0 10px; min-width: 55px;">
                    <span id="cd-mins" class="time-number" style="font-size: 2.2rem; display: block; font-variant-numeric: tabular-nums;">00</span>
                    <span class="time-label" style="font-size: 0.65rem; letter-spacing: 1px;">Min</span>
                </div>
                ${separator}
                <div class="time-box" style="padding: 0 10px; min-width: 55px;">
                    <span id="cd-secs" class="time-number" style="font-size: 2.2rem; display: block; font-variant-numeric: tabular-nums;">00</span>
                    <span class="time-label" style="font-size: 0.65rem; letter-spacing: 1px;">Seg</span>
                </div>
            </div>
        `;

        // Cacheando as referências
        const elDays = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins = document.getElementById('cd-mins');
        const elSecs = document.getElementById('cd-secs');

        const updateTimer = () => {
            const now = new Date().getTime();
            const gap = weddingDate - now;

            if (gap < 0) {
                countdownEl.innerHTML = `<div class="countdown-container"><span class="time-number">Chegou o Grande Dia!</span></div>`;
                clearInterval(timerInterval); 
                return;
            }

            // Atualiza apenas o texto puro da árvore HTML (salvando GPU e bateria)
            elDays.textContent = Math.floor(gap / (1000 * 60 * 60 * 24));
            elHours.textContent = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            elMins.textContent = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            elSecs.textContent = Math.floor((gap % (1000 * 60)) / 1000).toString().padStart(2, '0');
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    const rsvpForm = document.getElementById('rsvpForm');
    const input = document.getElementById('guestName');
    const listContainer = document.getElementById('guestList');
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrsdUK6pVUkZvx4Zs6nckV4LOBu8tpw990FG9c94HZ-hB9DD22sFIMsHDiE5Bi6rHfKg/exec';
    let guestDatabase = [];

    const normalizeText = (text) => String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (input && listContainer && rsvpForm) {
        const loadGuests = async () => {
            try {
                const response = await fetch(SCRIPT_URL);
                guestDatabase = await response.json();
            } catch (err) {
                console.error(err);
            }
        };
        loadGuests();

        const debounce = (func, delay) => {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };

        input.addEventListener('input', debounce(function() {
            const val = normalizeText(this.value);
            listContainer.innerHTML = ''; 
            
            if (val.length < 2) {
                listContainer.style.display = 'none';
                return;
            }

            const matches = guestDatabase.filter(name => normalizeText(name).includes(val));

            if (matches.length > 0) {
                listContainer.style.display = 'block';
                const fragment = document.createDocumentFragment();
                
                matches.forEach(name => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerText = name; 
                    item.addEventListener('click', () => {
                        input.value = name; 
                        listContainer.style.display = 'none'; 
                    });
                    fragment.appendChild(item);
                });
                listContainer.appendChild(fragment);
            } else {
                listContainer.style.display = 'none';
            }
        }, 300));

        document.addEventListener('click', (e) => {
            if (e.target !== input) listContainer.style.display = 'none';
        });

        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = normalizeText(input.value);

            if (!name) return alert('Por favor, digite seu nome.');

            const dbName = guestDatabase.find(guest => normalizeText(guest) === name);
            if (!dbName) return alert('Nome não encontrado na lista ou já confirmado.');

            const btn = rsvpForm.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Confirmando...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('nome', dbName);

            try {
                const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
                const data = await response.json();

                if (data.result === 'success') {
                    alert(`Presença confirmada! Obrigado, ${dbName}.`);
                    rsvpForm.reset();
                    btn.innerText = 'Confirmado!';
                    guestDatabase = guestDatabase.filter(g => g !== dbName);
                } else {
                    throw new Error(data.message || 'Erro no servidor');
                }
            } catch (error) {
                alert('Erro de conexão. Tente novamente.');
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
});