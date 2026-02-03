param(
  [string]$BaseUrl = "http://127.0.0.1:8000",
  [string]$Email = "demo-$(Get-Random)@example.com",
  [string]$Password = "DemoPass123!",
  [string]$FullName = "Demo User",
  [string]$Sector = "Agriculture"
)

$ErrorActionPreference = "Stop"

Write-Host "BaseUrl: $BaseUrl"
Write-Host "Email:   $Email"

# 1) Register
$registerBody = @{
  email = $Email
  full_name = $FullName
  password = $Password
  sector = $Sector
}

try {
  $reg = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -ContentType "application/json" -Body ($registerBody | ConvertTo-Json)
  Write-Host "Registered user id: $($reg.id)"
} catch {
  Write-Host "Register failed (maybe already exists): $($_.Exception.Message)"
}

# 2) Token
$form = "username=$([uri]::EscapeDataString($Email))&password=$([uri]::EscapeDataString($Password))"
$token = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/token" -ContentType "application/x-www-form-urlencoded" -Body $form

if (-not $token.access_token) {
  throw "No access_token returned"
}

Write-Host "Got JWT token (first 24 chars): $($token.access_token.Substring(0, [Math]::Min(24, $token.access_token.Length)))..."

# 3) Call /users/me
$me = Invoke-RestMethod -Method Get -Uri "$BaseUrl/users/me" -Headers @{ Authorization = "Bearer $($token.access_token)" }

Write-Host "Authenticated as: $($me.email)"
$me | ConvertTo-Json -Depth 5
