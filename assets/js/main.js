document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navbar Scroll Animation
    const navbar = document.getElementById('mainNav');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // ... (parte da Navbar mantém igual) ...

    // 2. Countdown Generator
    const countdownEl = document.getElementById('countdown');
    
    if (countdownEl) {
        // Data: 04 de Julho de 2026, 16:00
        const weddingDate = new Date(2026, 6, 4, 16, 0, 0).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const gap = weddingDate - now;

            if (gap < 0) {
                // Se já passou, mostra mensagem elegante
                countdownEl.innerHTML = `
                    <div class="countdown-container">
                        <span class="time-number" style="font-size:2rem">Chegou o Grande Dia!</span>
                    </div>`;
                return;
            }

            const days = Math.floor(gap / (1000 * 60 * 60 * 24));
            const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            // HTML Limpo
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
});