document.addEventListener('DOMContentLoaded', () => {
    
    const navbar = document.getElementById('navbar');

    // Função que verifica a rolagem
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Se rolar mais de 50px
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ... restante do seu código ...
});