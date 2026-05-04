@echo off
chcp 65001 >nul
title Courinvest Hub — Atualizando GitHub...
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║     COURINVEST HUB — AUTO DEPLOY     ║
echo  ╚══════════════════════════════════════╝
echo.

:: Vai para a pasta do repositório (mesma pasta do .bat)
cd /d "%~dp0"

:: Verifica se o Git está disponível
git --version >nul 2>&1
if errorlevel 1 (
    echo  [ERRO] Git nao encontrado!
    echo  Instale o Git em: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:: Verifica se index.html existe
if not exist "index.html" (
    echo  [ERRO] index.html nao encontrado nesta pasta!
    echo  Certifique-se que o script esta na pasta courinvest-hub
    echo.
    pause
    exit /b 1
)

echo  [1/4] Verificando alteracoes...
git status --short
echo.

:: Adiciona todos os arquivos modificados
echo  [2/4] Preparando arquivos...
git add -A

:: Cria mensagem de commit com data e hora
set HORA=%time:~0,5%
set DATA=%date:~0,10%
set MSG=Atualizacao Courinvest Hub - %DATA% %HORA%

:: Faz o commit
echo  [3/4] Salvando commit...
git commit -m "%MSG%"

if errorlevel 1 (
    echo.
    echo  Nenhuma alteracao nova detectada.
    echo  O arquivo ja esta atualizado no GitHub!
    echo.
    pause
    exit /b 0
)

:: Envia para o GitHub
echo.
echo  [4/4] Enviando para o GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao enviar. Verifique sua conexao com a internet.
    echo.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   SUCESSO! GitHub atualizado!        ║
echo  ║   O site atualiza em 1-2 minutos.   ║
echo  ╚══════════════════════════════════════╝
echo.
timeout /t 4 >nul
exit /b 0
