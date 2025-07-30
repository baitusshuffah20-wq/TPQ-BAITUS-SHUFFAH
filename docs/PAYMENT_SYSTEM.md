# Sistem Pembayaran TPQ Baitus Shuffah

## Overview
Sistem pembayaran yang terintegrasi mendukung berbagai metode pembayaran termasuk payment gateway dan transfer bank manual.

## Fitur Utama

### 1. Payment Gateway Management
- **Lokasi**: `/dashboard/admin/payment-gateway`
- **Fitur**:
  - CRUD payment gateway (Midtrans, Xendit, dll)
  - Toggle aktif/nonaktif gateway
  - Konfigurasi biaya dan provider
  - Support berbagai jenis: Credit Card, E-Wallet, QRIS, Virtual Account

### 2. Bank Account Management
- **Lokasi**: `/dashboard/admin/bank-accounts`
- **Fitur**:
  - CRUD rekening bank yayasan
  - Set rekening default
  - Toggle aktif/nonaktif rekening
  - Support berbagai bank (BCA, BNI, BRI, Mandiri, dll)

### 3. Universal Payment Method Selector
- **Komponen**: `PaymentMethodSelector`
- **Fitur**:
  - Menampilkan semua metode pembayaran aktif
  - Kalkulasi biaya otomatis
  - Detail transfer untuk bank manual
  - Copy to clipboard untuk nomor rekening dan jumlah

## Database Schema

### PaymentGateway
```sql
- id: String (Primary Key)
- name: String (Unique)
- type: String (BANK_TRANSFER, E_WALLET, QRIS, etc.)
- provider: String (MIDTRANS, XENDIT, etc.)
- isActive: Boolean
- config: Json (API keys, etc.)
- fees: Json (Fee structure)
- description: String?
- logo: String?
- sortOrder: Int
```

### BankAccount
```sql
- id: String (Primary Key)
- bankName: String
- accountNumber: String
- accountName: String
- branch: String?
- isActive: Boolean
- isDefault: Boolean
- description: String?
- logo: String?
- sortOrder: Int
```

### Transaction (Updated)
```sql
- paymentMethod: String? (GATEWAY, BANK_TRANSFER, CASH)
- paymentGatewayId: String? (FK to PaymentGateway)
- bankAccountId: String? (FK to BankAccount)
```

## API Endpoints

### Payment Gateway
- `GET /api/payment-gateway` - List all gateways
- `POST /api/payment-gateway` - Create gateway
- `PUT /api/payment-gateway` - Toggle gateway status
- `GET /api/payment-gateway/[id]` - Get specific gateway
- `PUT /api/payment-gateway/[id]` - Update gateway
- `DELETE /api/payment-gateway/[id]` - Delete gateway

### Bank Accounts
- `GET /api/bank-accounts` - List all bank accounts
- `POST /api/bank-accounts` - Create bank account
- `GET /api/bank-accounts/[id]` - Get specific account
- `PUT /api/bank-accounts/[id]` - Update account
- `DELETE /api/bank-accounts/[id]` - Delete account

### Payment Methods (Combined)
- `GET /api/payment-methods` - Get all active payment methods
- Query params:
  - `type`: 'gateway', 'bank', or 'all'

## Komponen

### PaymentMethodSelector
```tsx
interface PaymentMethodSelectorProps {
  amount: number;
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
  className?: string;
}
```

**Fitur**:
- Loading state
- Fee calculation
- Bank transfer details dengan copy to clipboard
- Gateway payment info
- Responsive design

### UniversalCheckout (Updated)
- Menggunakan PaymentMethodSelector
- Support untuk bank transfer manual
- Upload bukti transfer
- Integrasi dengan payment gateway

## Penggunaan

### 1. Setup Payment Gateway
1. Masuk ke `/dashboard/admin/payment-gateway`
2. Klik "Tambah Gateway"
3. Isi konfigurasi (nama, provider, API keys, biaya)
4. Aktifkan gateway

### 2. Setup Bank Account
1. Masuk ke `/dashboard/admin/bank-accounts`
2. Klik "Tambah Rekening"
3. Isi detail rekening bank yayasan
4. Set sebagai default jika diperlukan

### 3. Implementasi di Form Checkout
```tsx
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';

function CheckoutForm() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  return (
    <PaymentMethodSelector
      amount={totalAmount}
      onMethodSelect={setSelectedMethod}
      selectedMethodId={selectedMethod?.id}
    />
  );
}
```

## Keamanan
- Validasi input pada semua endpoint
- Cek permission admin untuk management
- Sanitasi data konfigurasi payment gateway
- Validasi file upload untuk bukti transfer

## Testing
- Test page tersedia di `/test-payment`
- Unit test untuk komponen PaymentMethodSelector
- Integration test untuk API endpoints

## Troubleshooting

### Payment Gateway tidak muncul
- Pastikan gateway aktif (`isActive: true`)
- Cek konfigurasi API keys
- Periksa log error di console

### Bank Account tidak muncul
- Pastikan rekening aktif (`isActive: true`)
- Cek data rekening lengkap
- Periksa permission user

### Error saat checkout
- Validasi amount minimum/maximum
- Cek koneksi ke payment gateway
- Periksa konfigurasi callback URL
