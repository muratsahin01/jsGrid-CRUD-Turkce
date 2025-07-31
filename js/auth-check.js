document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        // Kullanıcı giriş yapmamış, login sayfasına yönlendir
        alert('Bu sayfayı görüntülemek için giriş yapmalısınız.');
        window.location.href = 'login.html';
    }
});
