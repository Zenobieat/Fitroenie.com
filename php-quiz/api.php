<?php
declare(strict_types=1);
require __DIR__ . '/db_connect.php';
$action = $_REQUEST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
function gen_pin(): string {
  $s = '';
  for ($i = 0; $i < 6; $i++) $s .= strval(random_int(0, 9));
  return $s;
}
function get_param(string $k): ?string {
  $v = $_POST[$k] ?? $_GET[$k] ?? null;
  if ($v === null) return null;
  $v = trim((string)$v);
  return $v === '' ? null : $v;
}
if ($action === 'create_game' && $method === 'POST') {
  $pdo->beginTransaction();
  try {
    $pin = gen_pin();
    for ($i = 0; $i < 5; $i++) {
      $st = $pdo->prepare('SELECT id FROM quiz_games WHERE pin = ? LIMIT 1');
      $st->execute([$pin]);
      if (!$st->fetch()) break;
      $pin = gen_pin();
    }
    $st = $pdo->prepare('INSERT INTO quiz_games (pin, status, current_question) VALUES (?, "lobby", NULL)');
    $st->execute([$pin]);
    $pdo->commit();
    json_ok(['pin' => $pin, 'status' => 'lobby']);
  } catch (Throwable $e) {
    $pdo->rollBack();
    json_err('create_failed');
  }
  exit;
}
if ($action === 'join_game') {
  $pin = get_param('pin');
  $name = get_param('name');
  if (!$pin || !$name) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('SELECT status FROM quiz_games WHERE pin = ? LIMIT 1');
  $st->execute([$pin]);
  $g = $st->fetch();
  if (!$g) { json_err('game_not_found'); exit; }
  if ($g['status'] === 'finished') { json_err('game_finished'); exit; }
  $st = $pdo->prepare('SELECT id FROM quiz_players WHERE game_pin = ? AND name = ? LIMIT 1');
  $st->execute([$pin, $name]);
  $p = $st->fetch();
  if ($p) {
    $st = $pdo->prepare('UPDATE quiz_players SET last_active = CURRENT_TIMESTAMP WHERE id = ?');
    $st->execute([$p['id']]);
  } else {
    $st = $pdo->prepare('INSERT INTO quiz_players (game_pin, name) VALUES (?, ?)');
    $st->execute([$pin, $name]);
  }
  json_ok(['joined' => true]);
  exit;
}
if ($action === 'start_game' && $method === 'POST') {
  $pin = get_param('pin');
  if (!$pin) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('UPDATE quiz_games SET status = "playing", current_question = 1 WHERE pin = ?');
  $st->execute([$pin]);
  json_ok(['started' => true]);
  exit;
}
if ($action === 'get_status') {
  $pin = get_param('pin');
  if (!$pin) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('SELECT status, current_question FROM quiz_games WHERE pin = ? LIMIT 1');
  $st->execute([$pin]);
  $g = $st->fetch();
  if (!$g) { json_err('game_not_found'); exit; }
  $st = $pdo->prepare('SELECT name, last_active FROM quiz_players WHERE game_pin = ? ORDER BY last_active DESC');
  $st->execute([$pin]);
  $players = $st->fetchAll();
  json_ok(['status' => $g['status'], 'current_question' => $g['current_question'], 'players' => $players]);
  exit;
}
json_err('unknown_action');
