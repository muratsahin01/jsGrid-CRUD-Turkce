$(function () { // Sayfa yüklendiğinde çalışır
  $("#jsGrid").jsGrid({ // jsGrid tabloyu başlatır
    width: "100%", // Tablo genişliği
    // height: "700px", // Tablo yüksekliği
    inserting: false, // Yeni kayıt ekleme modal ile yapılacak
    editing: false, // inline edit kapalı, modal ile olacak
    sorting: true, // Sıralama aktif
    paging: true, // Sayfalama aktsif
    filtering: true, // Filtreleme aktif
    autoload: true, // Otomatik veri yükleme
    pageSize: 7, // Sayfa başına kayıt
    pageButtonCount: 5, // Sayfa buton sayısı
    controller: {
      loadData: function (filter) { // Verileri yükler
        return $.ajax({
          type: "GET", // GET isteği
          url: "http://localhost:3000/api/employees", // API adresi
          data: filter, // Filtre parametreleri
          dataType: "json" // JSON veri tipi
        });
      },
      insertItem: function (item) { // Yeni kayıt ekler
        const formData = new FormData(); // FormData nesnesi oluştur
        ["Isim", "Pozisyon", "Ofis", "Yas", "Maas"].forEach(key => {
          if (item[key] !== undefined) formData.append(key, item[key]); // Text alanları ekle
        });
        if (item.Resim instanceof File) formData.append('resim', item.Resim); // Dosya ekle
        for (var pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]); // Debug için
        }
        return $.ajax({
          type: "POST", // POST isteği
          url: "http://localhost:3000/api/employees", // API adresi
          data: formData, // Form verisi
          processData: false, // FormData için
          contentType: false, // FormData için
        }).then(function (response) {
          $("#jsGrid").jsGrid("loadData"); // Tabloyu yenile
          return response;
        });
      },
      updateItem: function (item) { // Kayıt günceller
        const formData = new FormData(); // FormData nesnesi oluştur
        ["Isim", "Pozisyon", "Ofis", "Yas", "Maas"].forEach(key => {
          if (item[key] !== undefined) formData.append(key, item[key]); // Text alanları ekle
        });
        if (item.Resim instanceof File) formData.append('resim', item.Resim); // Dosya ekle
        for (var pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]); // Debug için
        }
        return $.ajax({
          type: "PUT", // PUT isteği
          url: "http://localhost:3000/api/employees/" + item.EmployeeId, // API adresi
          data: formData,
          processData: false,
          contentType: false,
        }).then(function (response) {
          $("#jsGrid").jsGrid("loadData"); // Tabloyu yenile
          return response;
        });
      },
      deleteItem: function (item) { // Kayıt siler
        return $.ajax({
          type: "DELETE", // DELETE isteği
          url: "http://localhost:3000/api/employees/" + item.EmployeeId // API adresi
        });
      }
    },
    fields: [
      { name: "EmployeeId", type: "number", width: 25, editing: false, visible: false }, // ID alanı (gizli)
      { name: "Isim", type: "text", width: 100, validate: "required" }, // İsim alanı
      { name: "Pozisyon", type: "text", width: 100 }, // Pozisyon alanı
      { name: "Ofis", type: "text", width: 80 }, // Ofis alanı
      { name: "Yas", type: "number", width: 40 }, // Yaş alanı
      { name: "Maas", type: "number", width: 60 }, // Maaş alanı
      {
        name: "Resim", title: "Resim", width: 80, align: "center", sorting: false, filtering: false,
        itemTemplate: function (value, item) { // Resim gösterimi
          console.log('jsGrid item:', item); // jsGrid satırını logla
          var dosya = item.Resim || item.resim; // Resim dosya adını al
          console.log('Resim alanı:', dosya); // Resim alanını logla
          if (dosya && typeof dosya === 'string' && dosya !== 'null' && dosya !== 'undefined') {
            return `<img src="http://localhost:3000/uploads/${dosya}" width="50" height="50" style="border:2px solid red;">`; // Resim önizleme
          } else {
            return 'Yok'; // Resim yoksa
          }
        },
        insertTemplate: function () { // Ekleme sırasında dosya inputu oluşturur
          this._insertResimFile = $("<input type='file' accept='image/*'>"); // Dosya seçme inputu
          return this._insertResimFile;
        },
        editTemplate: function () { //Düzenleme sırasında dosya inputu oluşturur
          this._editResimFile = $("<input type='file' accept='image/*'>"); // Dosya seçme inputu (düzenle)
          return this._editResimFile;
        },
        insertValue: function () { // Eklemede seçilen dosyayı döndürür
          return this._insertResimFile[0].files[0] || null; // Seçilen dosya
        },
        editValue: function () { // Düzenlemede seçilen dosyayı döndürür
          return this._editResimFile[0].files[0] || null; // Seçilen dosya (düzenle)
        }
      },
      {
        type: "control",
        editButton: false, // Inline edit butonu kapalı
        itemTemplate: function (value, item) { // Kontrol butonları
          var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments); // Varsayılan kontrol butonlarını ekle
          var $customButton = $("<button>").text("Güncelle").on("click", function (e) { // Güncelle butonu oluştur
            e.stopPropagation(); // Olayın yayılmasını engelle
            openUpdateModal(item); // Modal aç
          });
          return $result.add($customButton); // Kontrol butonlarını döndür
        }
      }
    ]
  });

  // Yeni Çalışan Ekle Butonu
  $("#yeniCalisanBtn").on("click", function() {
    $("#ekleModal").show();
    $("#modalOverlay").show();
  });

  // Resim önizleme (Ekleme)
  $("#ekle_resim").on("change", function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $("#ekle_resim_onizleme").attr('src', e.target.result).show();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  // Ekleme Formu
  $("#ekleForm").on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData();
    formData.append('Isim', $("#ekle_isim").val());
    formData.append('Pozisyon', $("#ekle_pozisyon").val());
    formData.append('Ofis', $("#ekle_ofis").val());
    formData.append('Yas', $("#ekle_yas").val());
    formData.append('Maas', $("#ekle_maas").val());
    var fileInput = document.getElementById('ekle_resim');
    if (fileInput.files[0]) {
      formData.append('resim', fileInput.files[0]);
    }

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/api/employees",
      data: formData,
      processData: false,
      contentType: false,
      success: function () {
        $("#ekleModal").hide();
        $("#modalOverlay").hide();
        $("#ekleForm")[0].reset();
        $("#ekle_resim_onizleme").hide();
        $("#jsGrid").jsGrid("loadData");
      },
      error: function () {
        alert('Ekleme hatası!');
      }
    });
  });
});

// Modal açma fonksiyonu
function openUpdateModal(item) { // Güncelleme modalını açar
  $("#guncelle_id").val(item.EmployeeId); // ID ata
  $("#guncelle_alan1").val(item.Isim); // İsim ata
  $("#guncelle_alan2").val(item.Pozisyon); // Pozisyon ata
  $("#guncelle_ofis").val(item.Ofis); // Ofis ata
  $("#guncelle_yas").val(item.Yas); // Yaş ata
  $("#guncelle_maas").val(item.Maas); // Maaş ata
  if (item.Resim && typeof item.Resim === 'string' && item.Resim !== 'null' && item.Resim !== 'undefined') {
    $("#guncelle_resim_onizleme").attr('src', '/uploads/' + item.Resim).show(); // Resim göster
  } else {
    $("#guncelle_resim_onizleme").attr('src', '').hide(); // Resim gizle
  }
  $("#guncelle_resim").off('change').on('change', function () { // Dosya inputu değişince çalışır
    if (this.files && this.files[0]) {
      var reader = new FileReader(); // Dosya okuyucu oluştur
      reader.onload = function (e) { // Dosya yüklendiğinde çalışır
        $("#guncelle_resim_onizleme").attr('src', e.target.result).show(); // Yeni resmi göster
      };
      reader.readAsDataURL(this.files[0]); // Dosyayı base64 olarak oku
    }
  });
  $("#guncelleModal").show(); // Modalı göster
  $("#modalOverlay").show();
  $("#guncelleForm")[0].onsubmit = function (e) { // Form submit olunca çalışır
    e.preventDefault(); // Formun default submitini engelle
    var formData = new FormData(); // FormData nesnesi oluştur
    formData.append('Isim', $("#guncelle_alan1").val()); // İsim ekle
    formData.append('Pozisyon', $("#guncelle_alan2").val()); // Pozisyon ekle
    formData.append('Ofis', $("#guncelle_ofis").val()); // Ofis ekle
    formData.append('Yas', $("#guncelle_yas").val()); // Yaş ekle
    formData.append('Maas', $("#guncelle_maas").val()); // Maaş ekle
    var fileInput = document.getElementById('guncelle_resim'); // Dosya inputunu al
    if (fileInput.files[0]) formData.append('resim', fileInput.files[0]); // Dosya ekle
    for (var pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]); // Debug
    }
    $.ajax({ // Ajax ile güncelleme isteği gönder
      type: "PUT", // PUT isteği
      url: "http://localhost:3000/api/employees/" + item.EmployeeId, // API adresi
      data: formData,
      processData: false,
      contentType: false,
      success: function () {
        $("#guncelleModal").hide(); // Modalı kapat
        $("#modalOverlay").hide();
        $("#jsGrid").jsGrid("loadData"); // Tabloyu yenile
      },
      error: function () { alert('Güncelleme hatası!'); }
    });
  };
}