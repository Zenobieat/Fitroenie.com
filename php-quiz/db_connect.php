<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
date_default_timezone_set('Europe/Brussels');
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';
$db_name = getenv('DB_NAME') ?: 'fitroenie_quiz';

// Fallback to SQLite if MySQL env vars not explicitly set or connection fails
$use_sqlite = !getenv('DB_HOST') && !getenv('DB_NAME');
$pdo = null;

try {
  if (!$use_sqlite) {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $opt = [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $opt);
  }
} catch (Throwable $e) {
  $use_sqlite = true;
}

if ($use_sqlite) {
  try {
    $db_file = __DIR__ . '/quiz.sqlite';
    $pdo = new PDO("sqlite:$db_file");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Auto-init tables for SQLite
    $pdo->exec("CREATE TABLE IF NOT EXISTS quiz_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pin TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'lobby',
      current_question INTEGER DEFAULT NULL,
      subject_name TEXT DEFAULT NULL,
      set_title TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Attempt to add columns if they don't exist (for existing DBs)
    try { $pdo->exec("ALTER TABLE quiz_games ADD COLUMN subject_name TEXT DEFAULT NULL"); } catch (Throwable $t) {}
    try { $pdo->exec("ALTER TABLE quiz_games ADD COLUMN set_title TEXT DEFAULT NULL"); } catch (Throwable $t) {}
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS quiz_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_pin TEXT NOT NULL,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(game_pin) REFERENCES quiz_games(pin) ON DELETE CASCADE
    )");

    try { $pdo->exec("ALTER TABLE quiz_players ADD COLUMN score INTEGER DEFAULT 0"); } catch (Throwable $t) {}


    $pdo->exec("CREATE TABLE IF NOT EXISTS quiz_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_pin TEXT NOT NULL,
      player_name TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      answer_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(game_pin) REFERENCES quiz_games(pin) ON DELETE CASCADE
    )");
  } catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'db_connect_failed', 'msg' => $e->getMessage()]);
    exit;
  }
}

function json_ok(array $data): void {
  header('Content-Type: application/json');
  echo json_encode(['ok' => true] + $data);
}
function json_err(string $code, array $data = []): void {
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => $code] + $data);
}
