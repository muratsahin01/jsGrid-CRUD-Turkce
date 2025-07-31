document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            alert(`Kayıt başarısız: ${error.message}`);
        } else {
            alert('Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.');
            window.location.href = 'login.html';
        }
    });
});
