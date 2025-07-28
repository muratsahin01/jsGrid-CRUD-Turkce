const express = require("express"); // Express framework'ü dahil ediyor
const cors = require("cors"); // CORS desteği için cors paketini dahil ediyor
const sqlite3 = require("sqlite3").verbose(); // SQLite veritabanı için sqlite3 paketini dahil ediyor
const app = express(); // Express uygulaması oluşturuyor
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // .jpg, .png, .webp vs.
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + ext);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));

const db = new sqlite3.Database("veritabani.db"); // veritabanı bağlantısı aktif

app.use(cors()); // Tüm isteklere CORS'u aktif ediyor
app.use(express.json()); // JSON gövdeli istekleri parse ediyor
app.use(express.urlencoded({ extended: true })); // URL-encoded gövdeli istekleri de parse et

// Tablon yoksa oluştur
// Çalışanlar tablosu yoksa oluşturur
// EmployeeId otomatik artan birincil anahtar
// Diğer alanlar çalışan bilgileriw

db.run(`CREATE TABLE IF NOT EXISTS employees (
    EmployeeId INTEGER PRIMARY KEY AUTOINCREMENT,
    Isim TEXT,
    Pozisyon TEXT,
    Ofis TEXT,
    Yas INTEGER,
    Maas INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS urunler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urunAdi TEXT,
    kategori TEXT,
    fiyat REAL,
    stok INTEGER,
    aciklama TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS abonelikler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aboneAdi TEXT,
    abonelikTuru TEXT,
    baslangicTarihi TEXT,
    bitisTarihi TEXT,
    eposta TEXT
)`);

// GET: Listele (tüm alanlarda filtreli)
app.get("/api/employees", (req, res) => {
    const { Isim, Pozisyon, Ofis, Yas, Maas } = req.query;
    let sql = "SELECT * FROM employees WHERE 1=1";
    let params = [];
    if (Isim) {
        sql += " AND Isim LIKE ?";
        params.push(`%${Isim}%`);
    }
    if (Pozisyon) {
        sql += " AND Pozisyon LIKE ?";
        params.push(`%${Pozisyon}%`);
    }
    if (Ofis) {
        sql += " AND Ofis LIKE ?";
        params.push(`%${Ofis}%`);
    }
    if (Yas) {
        sql += " AND Yas = ?";
        params.push(Yas);
    }
    if (Maas) {
        sql += " AND Maas = ?";
        params.push(Maas);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Her kayıtta 'resim' alanını 'Resim' olarak da ekle
        const fixedRows = rows.map(row => {
          if (row.resim !== undefined) row.Resim = row.resim;
          return row;
        });
        console.log("API employees verisi:", fixedRows); // Debug için eklendi
        res.json(fixedRows);
    });
});

// POST: Yeni ekle
app.post("/api/employees", upload.single('resim'), (req, res) => { // Yeni çalışan ekleyen POST endpoint'i
    const { Isim, Pozisyon, Ofis, Yas, Maas } = req.body; // İstekten gelen yeni çalışan verisi
    const resim = req.file ? req.file.filename : null;
    db.run(
        `INSERT INTO employees (Isim, Pozisyon, Ofis, Yas, Maas, Resim) VALUES (?, ?, ?, ?, ?, ?)`,
        [Isim, Pozisyon, Ofis, Yas, Maas, resim],
        function (err) {
            if (err) return res.status(500).json({ error: err.message }); // Hata varsa 500 döner
            res.json({ EmployeeId: this.lastID, Isim, Pozisyon, Ofis, Yas, Maas, Resim: resim }); // Eklenen çalışanı döndürür
        }
    );
});

// PUT: Güncelle
app.put("/api/employees/:id", upload.single('resim'), (req, res) => { // Çalışan güncelleyen PUT endpoint'i
  console.log("Gelen veri:", req.body, req.file); // Hata ayıklama için eklendi
  const { Isim, Pozisyon, Ofis, Yas, Maas } = req.body; // Güncellenecek çalışan verisi
  const resim = req.file ? req.file.filename : null;
  let sql, params;
  if (resim) {
    sql = `UPDATE employees SET Isim=?, Pozisyon=?, Ofis=?, Yas=?, Maas=?, Resim=? WHERE EmployeeId=?`;
    params = [Isim, Pozisyon, Ofis, Yas, Maas, resim, req.params.id];
  } else {
    sql = `UPDATE employees SET Isim=?, Pozisyon=?, Ofis=?, Yas=?, Maas=? WHERE EmployeeId=?`;
    params = [Isim, Pozisyon, Ofis, Yas, Maas, req.params.id];
  }
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message }); // Hata varsa 500 döner
    // Son güncel kaydı çekip Resim alanını da döndür
    db.get('SELECT * FROM employees WHERE EmployeeId=?', [req.params.id], function(err2, row) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(row);
    });
  });
});

// DELETE: Sil
app.delete("/api/employees/:id", (req, res) => { // Çalışan silen DELETE endpoint'i
    db.run(`DELETE FROM employees WHERE EmployeeId=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message }); // Hata varsa 500 döner
        res.sendStatus(204); // Başarılıysa 204 No Content döner
    });
});

// Arama: İsme göre filtrele
app.get("/api/employees/search", (req, res) => {
    const { q } = req.query;
    db.all(
        "SELECT * FROM employees WHERE Isim LIKE ?",
        [`%${q}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Ürünleri getir
app.get('/api/urunler', (req, res) => {
    let query = "SELECT * FROM urunler WHERE 1=1";
    const params = [];

    if (req.query.urunAdi) {
        query += " AND urunAdi LIKE ?";
        params.push(`%${req.query.urunAdi}%`);
    }
    if (req.query.kategori) {
        query += " AND kategori LIKE ?";
        params.push(`%${req.query.kategori}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Ürün ekle
app.post('/api/urunler', (req, res) => {
    const { urunAdi, kategori, fiyat, stok, aciklama } = req.body;
    db.run("INSERT INTO urunler (urunAdi, kategori, fiyat, stok, aciklama) VALUES (?, ?, ?, ?, ?)",
        [urunAdi, kategori, fiyat, stok, aciklama],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id: this.lastID, ...req.body });
        });
});

// Ürün güncelle
app.put('/api/urunler', (req, res) => {
    const { id, urunAdi, kategori, fiyat, stok, aciklama } = req.body;
    db.run("UPDATE urunler SET urunAdi=?, kategori=?, fiyat=?, stok=?, aciklama=? WHERE id=?",
        [urunAdi, kategori, fiyat, stok, aciklama, id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json(req.body);
        });
});

// Ürün sil
app.delete('/api/urunler', (req, res) => {
    const { id } = req.body;
    db.run("DELETE FROM urunler WHERE id=?", [id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ success: true });
    });
});

// Abonelikler tablosu endpointleri
app.get('/api/abonelikler', (req, res) => {
    let query = "SELECT * FROM abonelikler WHERE 1=1";
    const params = [];

    if (req.query.aboneAdi) {
        query += " AND aboneAdi LIKE ?";
        params.push(`%${req.query.aboneAdi}%`);
    }
    if (req.query.abonelikTuru) {
        query += " AND abonelikTuru LIKE ?";
        params.push(`%${req.query.abonelikTuru}%`);
    }
    if (req.query.eposta) {
        query += " AND eposta LIKE ?";
        params.push(`%${req.query.eposta}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/abonelikler', (req, res) => {
    const { aboneAdi, abonelikTuru, baslangicTarihi, bitisTarihi, eposta } = req.body;
    db.run("INSERT INTO abonelikler (aboneAdi, abonelikTuru, baslangicTarihi, bitisTarihi, eposta) VALUES (?, ?, ?, ?, ?)",
        [aboneAdi, abonelikTuru, baslangicTarihi, bitisTarihi, eposta],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json({ id: this.lastID, ...req.body });
        });
});

app.put('/api/abonelikler', (req, res) => {
    const { id, aboneAdi, abonelikTuru, baslangicTarihi, bitisTarihi, eposta } = req.body;
    db.run("UPDATE abonelikler SET aboneAdi=?, abonelikTuru=?, baslangicTarihi=?, bitisTarihi=?, eposta=? WHERE id=?",
        [aboneAdi, abonelikTuru, baslangicTarihi, bitisTarihi, eposta, id],
        function(err) {
            if (err) return res.status(500).json({error: err.message});
            res.json(req.body);
        });
});

app.delete('/api/abonelikler', (req, res) => {
    const { id } = req.body;
    db.run("DELETE FROM abonelikler WHERE id=?", [id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ success: true });
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'anasayfa.html'));
});

app.listen(3000, () => console.log("API 3000 portunda veritabanıyla çalışıyor")); // Sunucuyu 3000 portunda başlatır
