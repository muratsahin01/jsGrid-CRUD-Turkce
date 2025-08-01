$(function() {
    // 1. URL'den tablo adını al
    const urlParams = new URLSearchParams(window.location.search);
    const tableName = urlParams.get('table');

    if (!tableName) {
        $("#table-title").text("Hata: Tablo adı belirtilmemiş.").css("color", "red");
        return;
    }

    $("#table-title").text(tableName + " Tablosu");

    // 2. Sunucudan tablo şemasını (sütunları) al
    $.ajax({
        url: `/api/tables/${tableName}/schema`,
        type: "GET",
        dataType: "json"
    }).done(function(columns) {
        // 3. jsGrid için alanları (fields) oluştur
        const gridFields = columns
            .filter(col => col.name.toLowerCase() !== 'id') // 'id' sütununu gridde gösterme
            .map(col => {
                let fieldType;
                const colType = col.type.toUpperCase();
                if (colType.includes('INT')) {
                    fieldType = 'number';
                } else if (colType.includes('DATE')) {
                    fieldType = 'text'; // jsGrid'in yerleşik bir tarih seçicisi yok, text olarak kullanabiliriz
                } else {
                    fieldType = 'text';
                }
                return {
                    name: col.name,
                    type: fieldType,
                    width: 150,
                    validate: "required"
                };
            });

        // Kontrol (silme, düzenleme) sütununu ekle
        gridFields.push({ type: "control" });

        // 4. jsGrid'i yapılandır ve başlat
        $("#jsGrid").jsGrid({
            width: "100%",
            height: "auto",

            inserting: true,
            editing: true,
            sorting: true,
            paging: true,
            autoload: true,

            pageSize: 15,
            pageButtonCount: 5,

            deleteConfirm: "Bu kaydı silmek istediğinizden emin misiniz?",

            controller: {
                loadData: function(filter) {
                    return $.ajax({
                        type: "GET",
                        url: `/api/tables/${tableName}`,
                        data: filter
                    });
                },
                insertItem: function(item) {
                    return $.ajax({
                        type: "POST",
                        url: `/api/tables/${tableName}`,
                        data: item
                    });
                },
                updateItem: function(item) {
                    return $.ajax({
                        type: "PUT",
                        url: `/api/tables/${tableName}`,
                        data: item
                    });
                },
                deleteItem: function(item) {
                    return $.ajax({
                        type: "DELETE",
                        url: `/api/tables/${tableName}`,
                        data: item
                    });
                }
            },

            fields: gridFields
        });

    }).fail(function(jqXHR, textStatus, errorThrown) {
        $("#table-title").text(`Hata: ${tableName} şeması yüklenemedi.`).css("color", "red");
        console.error("Schema loading error:", errorThrown);
    });
});
