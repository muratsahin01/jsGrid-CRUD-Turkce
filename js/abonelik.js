$(function() {
  $("#jsGrid").jsGrid({
    width: "100%",
    inserting: true,
    editing: false, // In-line düzenleme kapatıldı
    sorting: true,
    paging: true,
    autoload: true,
    filtering: true,
    pageSize: 7,
    pageButtonCount: 5,
    controller: {
      loadData: function(filter) {
        return $.ajax({
          type: "GET",
          url: "/api/abonelikler",
          data: filter
        });
      },
      insertItem: function(item) {
        return $.ajax({
          type: "POST",
          url: "/api/abonelikler",
          data: item,
          contentType: "application/x-www-form-urlencoded"
        });
      },
      deleteItem: function(item) {
        return $.ajax({
          type: "DELETE",
          url: "/api/abonelikler",
          data: item,
          contentType: "application/x-www-form-urlencoded"
        });
      }
    },
    fields: [
      { name: "id", type: "number", visible: false },
      { name: "aboneAdi", type: "text", title: "Abone Adı", width: 100, validate: "required" },
      { name: "abonelikTuru", type: "text", title: "Abonelik Türü", width: 80 },
      { name: "baslangicTarihi", type: "text", title: "Başlangıç Tarihi", width: 80 },
      { name: "bitisTarihi", type: "text", title: "Bitiş Tarihi", width: 80 },
      { name: "eposta", type: "text", title: "E-posta", width: 120 },
      { 
        type: "control",
        editButton: false, // Satır içi düzenleme butonu kapalı
        itemTemplate: function(value, item) {
          var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
          var $customButton = $("<button>").text("Güncelle").on("click", function(e) {
            e.stopPropagation();
            openUpdateModal(item);
          });
          return $result.add($customButton);
        }
      }
    ]
  });
});

function openUpdateModal(item) {
  $("#guncelle_id").val(item.id);
  $("#guncelle_aboneAdi").val(item.aboneAdi);
  $("#guncelle_abonelikTuru").val(item.abonelikTuru);
  $("#guncelle_baslangicTarihi").val(item.baslangicTarihi);
  $("#guncelle_bitisTarihi").val(item.bitisTarihi);
  $("#guncelle_eposta").val(item.eposta);
  
  $("#guncelleModal").show();
  
  $("#guncelleForm").off("submit").on("submit", function(e) {
    e.preventDefault();
    var updatedItem = {
      id: $("#guncelle_id").val(),
      aboneAdi: $("#guncelle_aboneAdi").val(),
      abonelikTuru: $("#guncelle_abonelikTuru").val(),
      baslangicTarihi: $("#guncelle_baslangicTarihi").val(),
      bitisTarihi: $("#guncelle_bitisTarihi").val(),
      eposta: $("#guncelle_eposta").val()
    };

    $.ajax({
      type: "PUT",
      url: "/api/abonelikler", 
      data: updatedItem,
      contentType: "application/x-www-form-urlencoded",
      success: function() {
        $("#guncelleModal").hide();
        $("#jsGrid").jsGrid("loadData");
      },
      error: function() {
        alert('Güncelleme sırasında bir hata oluştu!');
      }
    });
  });
}
