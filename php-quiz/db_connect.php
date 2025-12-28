<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
date_default_timezone_set('Europe/Brussels');
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'your_db_user';
$db_pass = getenv('DB_PASS') ?: 'your_db_pass';
$db_name = getenv('DB_NAME') ?: 'your_db_name';
$dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
$opt = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false
];
try {
  $pdo = new PDO($dsn, $db_user, $db_pass, $opt);
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => 'db_connect_failed']);
  exit;
}
function json_ok(array $data): void {
  header('Content-Type: application/json');
  echo json_encode(['ok' => true] + $data);
}
function json_err(string $code, array $data = []): void {
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => $code] + $data);
}
