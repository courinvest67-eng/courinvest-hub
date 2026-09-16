# COURINVEST HUB - Deploy GitHub Pages
# Instrucoes:
#   1. Baixe este arquivo E o index.html para a pasta courinvest-hub
#   2. Clique com botao direito neste arquivo > Executar com PowerShell

$REPO_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BRANCH = "main"

Write-Host ""
Write-Host "=== COURINVEST HUB - Deploy ===" -ForegroundColor Yellow
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Git nao encontrado." -ForegroundColor Red
    pause; exit 1
}

$indexPath = Join-Path $REPO_DIR "index.html"
if (-not (Test-Path $indexPath)) {
    Write-Host "ERRO: index.html nao encontrado em $REPO_DIR" -ForegroundColor Red
    Write-Host "Baixe o index.html e coloque na mesma pasta que este script." -ForegroundColor Yellow
    pause; exit 1
}

$kb = [math]::Round((Get-Item $indexPath).Length / 1KB, 0)
Write-Host "OK - index.html encontrado ($kb KB)" -ForegroundColor Green

Set-Location $REPO_DIR

Write-Host "Sincronizando com GitHub..." -ForegroundColor Cyan
git pull origin $BRANCH 2>&1 | Out-Null

$data = Get-Date -Format "dd/MM/yyyy HH:mm"
$msg = "deploy: hub v266 - $data"
Write-Host "Commit: $msg" -ForegroundColor Cyan
Write-Host ""

$confirma = Read-Host "Confirma o deploy? (S/N)"
if ($confirma -notmatch "^[Ss]") {
    Write-Host "Cancelado." -ForegroundColor Yellow
    pause; exit 0
}

git add index.html
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nenhuma alteracao detectada." -ForegroundColor Yellow
    pause; exit 0
}

git commit -m $msg
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no commit." -ForegroundColor Red
    pause; exit 1
}

git push origin $BRANCH
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no push." -ForegroundColor Red
    pause; exit 1
}

Write-Host ""
Write-Host "=== DEPLOY CONCLUIDO! ===" -ForegroundColor Green
Write-Host "https://courinvest67-eng.github.io/courinvest-hub/" -ForegroundColor Cyan
Write-Host "Aguarde 1-2 minutos e atualize o browser (Ctrl+Shift+R)" -ForegroundColor Gray
Write-Host ""
pause
