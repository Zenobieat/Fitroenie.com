<?php
// Test Suite for Fitroenie Gamemode API
// Usage: php test_flow.php OR open in browser

$baseUrl = 'http://localhost:8000/php-quiz/api.php'; // Adjust if needed
if (isset($_SERVER['HTTP_HOST'])) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $baseUrl = "$protocol://" . $_SERVER['HTTP_HOST'] . "/php-quiz/api.php";
}

function call_api($params, $post = false) {
    global $baseUrl;
    $url = $baseUrl . '?' . http_build_query($params);
    $opts = [
        'http' => [
            'method' => $post ? 'POST' : 'GET',
            'header' => 'Content-type: application/x-www-form-urlencoded',
            'content' => $post ? http_build_query($params) : null,
            'ignore_errors' => true
        ]
    ];
    $context = stream_context_create($opts);
    $res = file_get_contents($url, false, $context);
    return json_decode($res, true);
}

function assert_true($condition, $msg) {
    echo $condition ? "[PASS] $msg\n" : "[FAIL] $msg\n";
    if (!$condition) exit(1);
}

echo "<pre>";
echo "Starting End-to-End Test Flow...\n";
echo "Target API: $baseUrl\n\n";

// 1. Create Game
echo "1. Creating Game...\n";
$res = call_api(['action' => 'create_game', 'subject_name' => 'Test Subject', 'set_title' => 'Test Set'], true);
assert_true(isset($res['ok']) && $res['ok'], "Game created");
$pin = $res['pin'];
echo "   PIN: $pin\n";

// 2. Join Game (Player 1)
echo "2. Joining Game (Player 1)...\n";
$res = call_api(['action' => 'join_game', 'pin' => $pin, 'name' => 'Tester1'], true);
assert_true(isset($res['ok']) && $res['ok'], "Player 1 joined");

// 3. Join Game (Player 2)
echo "3. Joining Game (Player 2)...\n";
$res = call_api(['action' => 'join_game', 'pin' => $pin, 'name' => 'Tester2'], true);
assert_true(isset($res['ok']) && $res['ok'], "Player 2 joined");

// 4. Start Game
echo "4. Starting Game...\n";
$res = call_api(['action' => 'start_game', 'pin' => $pin], true);
assert_true(isset($res['ok']) && $res['ok'], "Game started");

// 5. Get Status
echo "5. Checking Status...\n";
$res = call_api(['action' => 'get_status', 'pin' => $pin]);
assert_true($res['status'] === 'playing', "Status is 'playing'");
assert_true($res['current_question'] == 1, "Current question is 1");

// 6. Submit Answer (Player 1)
echo "6. Submitting Answer (Player 1)...\n";
$res = call_api(['action' => 'submit_answer', 'pin' => $pin, 'name' => 'Tester1', 'question_index' => 1, 'answer_index' => 2], true);
assert_true(isset($res['ok']) && $res['ok'], "Answer submitted");

// 7. Verify Answer recorded
echo "7. Verifying Answer in Status...\n";
$res = call_api(['action' => 'get_status', 'pin' => $pin]);
$found = false;
foreach ($res['answered_players'] as $ap) {
    if ($ap['player_name'] === 'Tester1' && $ap['answer_index'] == 2) $found = true;
}
assert_true($found, "Player 1 answer found in status");

// 8. Update Score
echo "8. Updating Score...\n";
$res = call_api(['action' => 'update_score', 'pin' => $pin, 'name' => 'Tester1', 'score' => 100], true);
assert_true(isset($res['ok']) && $res['ok'], "Score updated");

// 9. Verify Score
echo "9. Verifying Score...\n";
$res = call_api(['action' => 'get_status', 'pin' => $pin]);
$score = 0;
foreach ($res['players'] as $p) {
    if ($p['name'] === 'Tester1') $score = $p['score'];
}
assert_true($score == 100, "Player 1 score is 100");

echo "\nALL TESTS PASSED!\n";
echo "</pre>";
