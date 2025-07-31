$(function () {
  $("#jsGrid").jsGrid({
    width: "100%",
    inserting: false, // Modal ile eklenecek
    editing: false, // In-line düzenleme kapatıldı
    sorting: true,
    paging: true,
    autoload: true,
    filtering: true,
    pageSize: 7,
    pageButtonCount: 5,
    controller: {
      loadData: function (filter) {
        return $.ajax({
          type: "GET",
          url: "/api/urunler",
          data: filter
        });
      },
      insertItem: function (item) {
        return $.ajax({
          type: "POST",
          url: "/api/urunler",
          data: item,
          contentType: "application/x-www-form-urlencoded"
        });
      },
      deleteItem: function (item) {
        return $.ajax({
          type: "DELETE",
          url: "/api/urunler",
          data: item,
          contentType: "application/x-www-form-urlencoded"
        });
      }
    },
    fields: [
      { name: "id", type: "number", visible: false },
      { name: "urunAdi", type: "text", title: "Ürün Adı", width: 100, validate: "required" },
      { name: "kategori", type: "text", title: "Kategori", width: 80 },
      { name: "fiyat", type: "number", title: "Fiyat", width: 60 },
      { name: "stok", type: "number", title: "Stok Miktarı", width: 60 },
      { name: "aciklama", type: "text", title: "Açıklama", width: 150 },
      {
        type: "control",
        editButton: false, // Satır içi düzenleme butonu kapalı
        itemTemplate: function (value, item) {
          var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
          var $customButton = $("<button>").text("Güncelle").on("click", function (e) {
            e.stopPropagation();
            openUpdateModal(item);
          });
          return $result.add($customButton);
        }
      }
    ]
  });

  // Yeni Ürün Ekle Butonu
  $("#yeniUrunBtn").on("click", function() {
    $("#ekleModal").show();
    $("#modalOverlay").show();
  });

  // Ekleme Formu
  $("#ekleForm").on("submit", function(e) {
    e.preventDefault();
    var newItem = {
        urunAdi: $("#ekle_urunAdi").val(),
        kategori: $("#ekle_kategori").val(),
        fiyat: $("#ekle_fiyat").val(),
        stok: $("#ekle_stok").val(),
        aciklama: $("#ekle_aciklama").val()
    };

    $.ajax({
      type: "POST",
      url: "/api/urunler",
      data: newItem,
      success: function () {
        $("#ekleModal").hide();
        $("#modalOverlay").hide();
        $("#ekleForm")[0].reset();
        $("#jsGrid").jsGrid("loadData");
      },
      error: function () {
        alert('Ekleme hatası!');
      }
    });
  });
});

function openUpdateModal(item) {
  $("#guncelle_id").val(item.id);
  $("#guncelle_urunAdi").val(item.urunAdi);
  $("#guncelle_kategori").val(item.kategori);
  $("#guncelle_fiyat").val(item.fiyat);
  $("#guncelle_stok").val(item.stok);
  $("#guncelle_aciklama").val(item.aciklama);

  $("#guncelleModal").show();
  $("#modalOverlay").show();

  $("#guncelleForm").off("submit").on("submit", function (e) {
    e.preventDefault();
    var updatedItem = {
      id: $("#guncelle_id").val(),
      urunAdi: $("#guncelle_urunAdi").val(),
      kategori: $("#guncelle_kategori").val(),
      fiyat: $("#guncelle_fiyat").val(),
      stok: $("#guncelle_stok").val(),
      aciklama: $("#guncelle_aciklama").val()
    };

    $.ajax({
      type: "PUT",
      url: "/api/urunler",
      data: updatedItem,
      contentType: "application/x-www-form-urlencoded",
      success: function () {
        $("#guncelleModal").hide();
        $("#modalOverlay").hide();
        $("#jsGrid").jsGrid("loadData");
      },
      error: function () {
        alert('Güncelleme sırasında bir hata oluştu!');
      }
    });
  });
}
