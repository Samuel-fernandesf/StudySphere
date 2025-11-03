document.addEventListener('DOMContentLoaded', function() {
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');

    btnLogin.addEventListener('click', function() {
        // Garante que o botão de login esteja ativo e o de signup inativo
        if (!btnLogin.classList.contains('active')) {
            btnLogin.classList.add('active');
            btnSignup.classList.remove('active');
        }
    });

    btnSignup.addEventListener('click', function() {
        // Garante que o botão de signup esteja ativo e o de login inativo
        if (!btnSignup.classList.contains('active')) {
            btnSignup.classList.add('active');
            btnLogin.classList.remove('active');
        }
    });
});
