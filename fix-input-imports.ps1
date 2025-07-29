# PowerShell script to fix Input imports
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Encoding UTF8
    $modified = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match 'import\s+Input\s+from\s+"@/components/ui/Input"') {
            $content[$i] = $content[$i] -replace 'import\s+Input\s+from\s+"@/components/ui/Input"', 'import { Input } from "@/components/ui/input"'
            $modified = $true
            Write-Host "Fixed import in: $($file.FullName)"
        }
        if ($content[$i] -match "import\s+Input\s+from\s+'@/components/ui/Input'") {
            $content[$i] = $content[$i] -replace "import\s+Input\s+from\s+'@/components/ui/Input'", "import { Input } from '@/components/ui/input'"
            $modified = $true
            Write-Host "Fixed import in: $($file.FullName)"
        }
    }
    
    if ($modified) {
        $content | Set-Content $file.FullName -Encoding UTF8
    }
}

Write-Host "Input import fix completed!"
