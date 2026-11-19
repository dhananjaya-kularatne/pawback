$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$previousApiUrl = $env:VITE_API_BASE_URL

try {
    Push-Location (Join-Path $projectRoot "frontend")
    try {
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
        npm run lint
        if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed." }
        $env:VITE_API_BASE_URL = "/api"
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
    } finally {
        Pop-Location
    }

    Push-Location (Join-Path $projectRoot "backend")
    try {
        & .\mvnw.cmd clean package -Pazure "-Dmaven.test.skip=true"
        if ($LASTEXITCODE -ne 0) { throw "Backend packaging failed." }
    } finally {
        Pop-Location
    }

    $jarPath = Join-Path $projectRoot "backend\target\azure\pawback-0.0.1-SNAPSHOT.jar"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($jarPath)
    try {
        foreach ($entry in $archive.Entries) {
            if ($entry.FullName.StartsWith("BOOT-INF/classes/") -and $entry.FullName.EndsWith(".class")) {
                $stream = $entry.Open()
                $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
                try {
                    if ($reader.ReadToEnd().Contains("Unresolved compilation")) {
                        throw "IDE compilation error found in packaged class: $($entry.FullName)"
                    }
                } finally {
                    $reader.Dispose()
                }
            }
        }
        if (!$archive.GetEntry("BOOT-INF/classes/static/index.html")) {
            throw "The packaged frontend index.html is missing."
        }
    } finally {
        $archive.Dispose()
    }

    Write-Host "Deployment package ready (packaged classes and frontend verified):"
    Write-Host $jarPath
} finally {
    $env:VITE_API_BASE_URL = $previousApiUrl
}
