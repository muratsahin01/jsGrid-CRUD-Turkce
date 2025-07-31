async function logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Çıkış yaparken hata oluştu:', error);
        alert(`Çıkış başarısız: ${error.message}`);
    } else {
        // Oturum bilgisi localStorage'dan temizlenir (Supabase bunu otomatik yapar)
        alert('Başarıyla çıkış yaptınız.');
        window.location.href = 'login.html';
    }
}
