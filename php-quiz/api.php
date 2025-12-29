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
function quiz_log(string $msg) {
  $line = date('Y-m-d H:i:s') . " - " . $msg . "\n";
  @file_put_contents(__DIR__ . '/quiz.log', $line, FILE_APPEND);
}
if ($action === 'create_game' && $method === 'POST') {
  $subject = get_param('subject_name');
  $title = get_param('set_title');
  $pdo->beginTransaction();
  try {
    $pin = gen_pin();
    for ($i = 0; $i < 5; $i++) {
      $st = $pdo->prepare('SELECT id FROM quiz_games WHERE pin = ? LIMIT 1');
      $st->execute([$pin]);
      if (!$st->fetch()) break;
      $pin = gen_pin();
    }
    $st = $pdo->prepare('INSERT INTO quiz_games (pin, status, current_question, subject_name, set_title) VALUES (?, "lobby", NULL, ?, ?)');
    $st->execute([$pin, $subject, $title]);
    $pdo->commit();
    quiz_log("Game created: PIN=$pin, Subject=$subject");
    json_ok(['pin' => $pin, 'status' => 'lobby']);
  } catch (Throwable $e) {
    $pdo->rollBack();
    quiz_log("Create game failed: " . $e->getMessage());
    json_err('create_failed');
  }
  exit;
}
if ($action === 'join_game') {
  $pin = get_param('pin');
  $name = get_param('name');
  if (!$pin || !$name) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('SELECT status, subject_name, set_title FROM quiz_games WHERE pin = ? LIMIT 1');
  $st->execute([$pin]);
  $g = $st->fetch();
  if (!$g) { 
      quiz_log("Join failed: Game not found PIN=$pin Name=$name");
      json_err('game_not_found'); exit; 
  }
  if ($g['status'] !== 'lobby') { 
      quiz_log("Join failed: Game started/finished PIN=$pin Name=$name Status={$g['status']}");
      json_err('game_already_started_or_finished'); exit; 
  }
  
  // Check max players
  $st = $pdo->prepare('SELECT COUNT(*) as cnt FROM quiz_players WHERE game_pin = ?');
  $st->execute([$pin]);
  $cnt = $st->fetch()['cnt'];
  
  $st = $pdo->prepare('SELECT id FROM quiz_players WHERE game_pin = ? AND name = ? LIMIT 1');
  $st->execute([$pin, $name]);
  $p = $st->fetch();

  if (!$p && $cnt >= 5) { 
      quiz_log("Join failed: Game full PIN=$pin Name=$name");
      json_err('game_full'); exit; 
  }

  if ($p) {
    $st = $pdo->prepare('UPDATE quiz_players SET last_active = CURRENT_TIMESTAMP WHERE id = ?');
    $st->execute([$p['id']]);
    quiz_log("Player rejoined: PIN=$pin Name=$name");
  } else {
    $st = $pdo->prepare('INSERT INTO quiz_players (game_pin, name) VALUES (?, ?)');
    $st->execute([$pin, $name]);
    quiz_log("Player joined: PIN=$pin Name=$name");
  }
  json_ok(['joined' => true, 'subject_name' => $g['subject_name'], 'set_title' => $g['set_title']]);
  exit;
}
if ($action === 'start_game' && $method === 'POST') {
  $pin = get_param('pin');
  if (!$pin) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('UPDATE quiz_games SET status = "playing", current_question = 1 WHERE pin = ?');
  $st->execute([$pin]);
  quiz_log("Game started: PIN=$pin");
  json_ok(['started' => true]);
  exit;
}
if ($action === 'update_game' && $method === 'POST') {
  $pin = get_param('pin');
  $status = get_param('status');
  $q = get_param('current_question');
  if (!$pin) { json_err('invalid_input'); exit; }
  
  $sql = 'UPDATE quiz_games SET ';
  $params = [];
  $updates = [];
  
  if ($status) {
      $updates[] = 'status = ?';
      $params[] = $status;
  }
  if ($q !== null) {
      $updates[] = 'current_question = ?';
      $params[] = $q;
  }
  
  if (empty($updates)) { json_ok(['updated' => false]); exit; }
  
  $sql .= implode(', ', $updates) . ' WHERE pin = ?';
  $params[] = $pin;
  
  $st = $pdo->prepare($sql);
  $st->execute($params);
  json_ok(['updated' => true]);
  exit;
}
if ($action === 'submit_answer' && $method === 'POST') {
  $pin = get_param('pin');
  $name = get_param('name');
  $q = get_param('question_index');
  $a = get_param('answer_index');
  
  if (!$pin || !$name || $q === null || $a === null) { json_err('invalid_input'); exit; }
  
  // Optional: check if game exists/is playing (omitted for speed)
  
  // Store answer
  // Check if already answered
  $st = $pdo->prepare('SELECT id FROM quiz_answers WHERE game_pin = ? AND player_name = ? AND question_index = ?');
  $st->execute([$pin, $name, $q]);
  if ($st->fetch()) {
      // Update existing
      $st = $pdo->prepare('UPDATE quiz_answers SET answer_index = ?, created_at = CURRENT_TIMESTAMP WHERE game_pin = ? AND player_name = ? AND question_index = ?');
      $st->execute([$a, $pin, $name, $q]);
  } else {
      // Insert new
      $st = $pdo->prepare('INSERT INTO quiz_answers (game_pin, player_name, question_index, answer_index) VALUES (?, ?, ?, ?)');
      $st->execute([$pin, $name, $q, $a]);
  }
  
  quiz_log("Answer submitted: PIN=$pin Name=$name Q=$q A=$a");
  json_ok(['submitted' => true]);
  exit;
}
if ($action === 'update_score' && $method === 'POST') {
  $pin = get_param('pin');
  $name = get_param('name');
  $score = get_param('score');
  
  if (!$pin || !$name || $score === null) { json_err('invalid_input'); exit; }
  
  $st = $pdo->prepare('UPDATE quiz_players SET score = ? WHERE game_pin = ? AND name = ?');
  $st->execute([$score, $pin, $name]);
  
  json_ok(['updated' => true]);
  exit;
}
if ($action === 'get_status') {
  $pin = get_param('pin');
  if (!$pin) { json_err('invalid_input'); exit; }
  $st = $pdo->prepare('SELECT status, current_question, subject_name, set_title FROM quiz_games WHERE pin = ? LIMIT 1');
  $st->execute([$pin]);
  $g = $st->fetch();
  if (!$g) { json_err('game_not_found'); exit; }
  
  $st = $pdo->prepare('SELECT name, score, last_active FROM quiz_players WHERE game_pin = ? ORDER BY score DESC, last_active DESC');
  $st->execute([$pin]);
  $players = $st->fetchAll();
  
  // Get answers for current question
   $answers = [];
   if ($g['current_question'] !== null) {
       $st = $pdo->prepare('SELECT player_name, answer_index FROM quiz_answers WHERE game_pin = ? AND question_index = ?');
       $st->execute([$pin, $g['current_question']]);
       $answers = $st->fetchAll();
   }

   json_ok([
    'status' => $g['status'],
    'current_question' => $g['current_question'],
    'subject_name' => $g['subject_name'],
    'set_title' => $g['set_title'],
    'players' => $players,
    'answered_players' => $answers
  ]);
  exit;
}
json_err('unknown_action');
