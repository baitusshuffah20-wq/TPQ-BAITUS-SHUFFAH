# Script sederhana untuk backup XAMPP

# Konfigurasi
$backupDir = "$env:USERPROFILE\Desktop\XAMPP_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$xamppPath = "C:\xampp"
$projectPath = "C:\xampp\htdocs\sistem-informasi-TPQ-baitus-shuffahh"

# Buat direktori backup
Write-Host "Membuat direktori backup di $backupDir..."
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\project" -Force | Out-Null

# Backup proyek
Write-Host "Membackup proyek dari $projectPath..."
Copy-Item -Path "$projectPath\*" -Destination "$backupDir\project" -Recurse -Force

Write-Host "Backup proyek selesai!"
Write-Host "Semua file backup tersimpan di: $backupDir"
Write-Host "Silakan lanjutkan dengan mengunduh dan menginstal XAMPP versi terbaru."

Write-Host "Tekan Enter untuk keluar..."
Read-Host