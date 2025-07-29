# PowerShell script to fix Button imports
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Encoding UTF8
    $modified = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match 'import\s+Button\s+from\s+"@/components/ui/Button"') {
            $content[$i] = $content[$i] -replace 'import\s+Button\s+from\s+"@/components/ui/Button"', 'import { Button } from "@/components/ui/button"'
            $modified = $true
            Write-Host "Fixed import in: $($file.FullName)"
        }
    }
    
    if ($modified) {
        $content | Set-Content $file.FullName -Encoding UTF8
    }
}

Write-Host "Button import fix completed!"
