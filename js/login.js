document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert(`Giriş başarısız: ${error.message}`);
        } else {
            // Kullanıcı bilgilerini (örneğin token) saklayabilirsiniz.
            // localStorage.setItem('supabase.auth.token', data.session.access_token);
            alert('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...');
            window.location.href = 'index.html'; // Giriş sonrası yönlendirilecek sayfa
        }
    });
});
