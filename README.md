# Kişisel Görev Yönetim Sistemi

.NET 8 Web API backend ve React + PrimeReact frontend ile geliştirilmiş kişisel görev yönetim uygulaması.

## Özellikler

- Kullanıcı kayıt/giriş (JWT authentication, BCrypt şifre hash'leme)
- Görev (task) oluşturma, düzenleme, silme, durum güncelleme
- Kategori oluşturma, düzenleme, silme
- Görevlerde filtreleme ve arama (kategori, öncelik, durum, metin araması)
- Responsive tasarım (PrimeFlex)
- Görev yorumları ve dosya ekleri (backend hazır)

## Teknoloji Yığını

**Backend:**
- .NET 8 Web API
- Entity Framework Core + PostgreSQL
- JWT Bearer Authentication
- BCrypt.Net-Next (şifre hash'leme)
- Swashbuckle (Swagger/OpenAPI)

**Frontend:**
- React 18 + TypeScript
- Vite
- PrimeReact + PrimeFlex + PrimeIcons
- React Router
- Axios

## Kurulum

### Ön Gereksinimler
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 16+

### Backend

```bash
cd Backend/TaskManagement.API
dotnet restore
dotnet ef database update
dotnet run
```

API `http://localhost:5183` adresinde çalışır. Swagger UI: `http://localhost:5183/swagger`

`appsettings.json` içindeki `ConnectionStrings:DefaultConnection` değerini kendi PostgreSQL bilgilerinle güncellemen gerekir.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışır.

## Proje Yapısı
TaskManagementSystem/
├── Backend/
│ └── TaskManagement.API/
│ ├── Controllers/ # API endpoint'leri
│ ├── Models/ # Entity sınıfları
│ ├── DTOs/ # Data Transfer Object'ler
│ ├── Data/ # DbContext
│ ├── Services/ # JWT token servisi
│ ├── Middleware/ # Global exception handling
│ └── Migrations/ # EF Core migration'ları
└── Frontend/
└── src/
├── pages/ # Sayfa bileşenleri (Login, Register, Tasks, Categories)
├── components/ # Paylaşılan bileşenler
├── services/ # API çağrıları
├── context/ # Auth context
└── types/ # TypeScript tip tanımları


## Veritabanı Şeması

- **Users** — kullanıcı bilgileri
- **Categories** — görev kategorileri (kullanıcıya özel)
- **Tasks** — görevler (başlık, açıklama, öncelik, durum, bitiş tarihi)
- **TaskComments** — görev yorumları
- **TaskAttachments** — görev dosya ekleri