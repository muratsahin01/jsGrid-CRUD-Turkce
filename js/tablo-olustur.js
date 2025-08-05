document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-table-form');
    const columnsContainer = document.getElementById('columns-container');
    const addColumnBtn = document.getElementById('add-column');
    const responseMessage = document.getElementById('response-message');

    // Yeni sütun ekleme butonu
    addColumnBtn.addEventListener('click', () => {
        const newColumn = document.createElement('div');
        newColumn.classList.add('column-definition');
        newColumn.innerHTML = `
            <input type="text" name="columnName" required placeholder="Sütun Adı">
            <select name="columnType">
                <option value="TEXT">Metin</option>
                <option value="INTEGER">Sayı</option>
                <option value="REAL">Ondalıklı Sayı</option>
                <option value="DATE">Tarih</option>
            </select>
            <button type="button" class="remove-column">Kaldır</button>
        `;
        columnsContainer.appendChild(newColumn);
    });

    // Sütun silme
    columnsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-column')) {
            e.target.parentElement.remove();
        }
    });

    // Formu sunucuya gönderme
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        responseMessage.textContent = '';

        const formData = new FormData(form);
        const tableName = formData.get('tableName');
        const columnNames = formData.getAll('columnName');
        const columnTypes = formData.getAll('columnType');

        if (!tableName || columnNames.length === 0) {
            responseMessage.textContent = 'Tablo adı ve en az bir sütun gereklidir.';
            responseMessage.style.color = 'red';
            return;
        }

        const columns = columnNames.map((name, index) => ({
            name: name,
            type: columnTypes[index]
        }));

        try {
            const response = await fetch('/api/create-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tableName, columns })
            });

            const result = await response.json();

            if (response.ok) {
                responseMessage.textContent = result.message;
                responseMessage.style.color = 'green';
                form.reset();
                // İlk sütun tanımını geri ekle
                columnsContainer.innerHTML = `
                    <div class="column-definition">
                        <input type="text" name="columnName" required placeholder="Sütun Adı">
                        <select name="columnType">
                            <option value="TEXT">Metin</option>
                            <option value="INTEGER">Sayı</option>
                            <option value="REAL">Ondalıklı Sayı</option>
                            <option value="DATE">Tarih</option>
                        </select>
                    </div>
                `;
            } else {
                throw new Error(result.message || 'Bir hata oluştu.');
            }
        } catch (error) {
            responseMessage.textContent = `Hata: ${error.message}`;
            responseMessage.style.color = 'red';
        }
    });
});
