# Script untuk membantu proses update XAMPP
# Dibuat untuk membantu backup data sebelum update

# Konfigurasi
$backupDir = "$env:USERPROFILE\Desktop\XAMPP_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$xamppPath = "C:\xampp"
$projectPath = "C:\xampp\htdocs\sistem-informasi-TPQ-baitus-shuffahh"
$mysqlDataPath = "C:\xampp\mysql\data"
$mysqlBinPath = "C:\xampp\mysql\bin"
$mysqlUser = "root"
$mysqlPassword = ""  # Sesuaikan dengan password MySQL Anda jika ada

# Buat direktori backup
Write-Host "Membuat direktori backup di $backupDir..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\databases" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\project" -Force | Out-Null

# Backup proyek
Write-Host "Membackup proyek dari $projectPath..." -ForegroundColor Cyan
Copy-Item -Path "$projectPath\*" -Destination "$backupDir\project" -Recurse -Force

# Dapatkan daftar database
Write-Host "Mendapatkan daftar database..." -ForegroundColor Cyan
$databases = Get-ChildItem -Path $mysqlDataPath -Directory | 
    Where-Object { $_.Name -notin @('mysql', 'performance_schema', 'sys', 'information_schema') } |
    Select-Object -ExpandProperty Name

# Backup setiap database
foreach ($db in $databases) {
    Write-Host "Membackup database: $db..." -ForegroundColor Green
    $outputFile = "$backupDir\databases\$db.sql"
    
    # Gunakan mysqldump untuk backup database
    $mysqldumpCmd = """$mysqlBinPath\mysqldump.exe"" --user=$mysqlUser --databases $db --result-file=""$outputFile"""
    
    if ($mysqlPassword -ne "") {
        $mysqldumpCmd = $mysqldumpCmd -replace "--user=$mysqlUser", "--user=$mysqlUser --password=$mysqlPassword"
    }
    
    try {
        Invoke-Expression $mysqldumpCmd
        if (Test-Path $outputFile) {
            Write-Host "  Database $db berhasil dibackup ke $outputFile" -ForegroundColor Green
        } else {
            Write-Host "  Gagal membackup database $db" -ForegroundColor Red
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  Error saat membackup database $db: $errorMsg" -ForegroundColor Red
    }
}

# Buat file README dengan instruksi
$readmeContent = @"
# Backup XAMPP sebelum Update
Backup dibuat pada: $(Get-Date)

## Isi Backup:
1. Proyek: sistem-informasi-TPQ-baitus-shuffahh
2. Database: $($databases -join ', ')

## Cara Restore:
1. Install XAMPP versi baru
2. Salin folder 'project' ke C:\xampp\htdocs\
3. Untuk restore database:
   - Buka phpMyAdmin
   - Pilih tab 'Import'
   - Pilih file SQL dari folder 'databases'
   - Klik 'Go'

## Catatan:
- Pastikan Apache dan MySQL berjalan sebelum restore database
- Jika ada masalah koneksi database, periksa file konfigurasi di proyek
"@

$readmeContent | Out-File -FilePath "$backupDir\README.txt" -Encoding utf8

Write-Host "`nProses backup selesai!" -ForegroundColor Cyan
Write-Host "Semua file backup tersimpan di: $backupDir" -ForegroundColor Yellow
Write-Host "`nLangkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. Matikan semua layanan XAMPP dari Control Panel" -ForegroundColor White
Write-Host "2. Download XAMPP versi terbaru dari https://www.apachefriends.org/download.html" -ForegroundColor White
Write-Host "3. Install XAMPP versi baru" -ForegroundColor White
Write-Host "4. Restore data mengikuti petunjuk di $backupDir\README.txt" -ForegroundColor White

Write-Host "`nTekan Enter untuk keluar..." -ForegroundColor Gray
Read-Host