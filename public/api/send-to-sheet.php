<?php

header('Content-Type: application/json; charset=utf-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode([ 'ok' => false, 'error' => 'Method Not Allowed' ]);
    exit;
}

// Include helper
$rootDir = dirname(__DIR__, 2);
require_once $rootDir . DIRECTORY_SEPARATOR . 'googlespreadsheet.php';

// Configure your Google Sheet ID
$GOOGLE_SHEET_ID = '1dyf5kSwS8k2CpDmWI_PkCT_T0cXvyhjljBP36CpQoWc';

// Read JSON body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([ 'ok' => false, 'error' => 'Invalid JSON' ]);
    exit;
}

// Basic honeypot check
if (!empty($data['website'])) {
    http_response_code(400);
    echo json_encode([ 'ok' => false, 'error' => 'Bot detected' ]);
    exit;
}

// Required fields for this sheet
$required = [ 'email_cliente','nome_cognome_cliente','cellulare_cliente','importo_mutuo' ];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '' || is_array($data[$field])) {
        http_response_code(400);
        echo json_encode([ 'ok' => false, 'error' => 'Campo mancante: ' . $field ]);
        exit;
    }
}

// Enforce privacy consent
$privacy = isset($data['privacy_consent']) ? $data['privacy_consent'] : null;
$hasPrivacy = false;
if ($privacy === true) $hasPrivacy = true;
elseif (is_string($privacy)) {
    $v = strtolower(trim($privacy));
    $hasPrivacy = in_array($v, ['true','on','1','yes'], true);
} elseif (is_numeric($privacy)) {
    $hasPrivacy = (intval($privacy) === 1);
}
if (!$hasPrivacy) {
    http_response_code(400);
    echo json_encode([ 'ok' => false, 'error' => 'Consenso privacy obbligatorio' ]);
    exit;
}

// Column order (final, 15 columns):
// Data, Email cliente, Nome cliente, Telefono cliente, Importo mutuo, Valore immobile,
// Preferenza contatto, Consulente Euroansa, Email consulente Hora, Consulente Hora,
// NOTE, Consenso marketing, Status, MASSIMO FINANZIABILE, NOTE EUROANSA

$created_at = isset($data['created_at']) ? $data['created_at'] : date('c');

// Normalize marketing to 'true'/'false'
$marketing = 'false';
if (isset($data['marketing'])) {
    if ($data['marketing'] === true) $marketing = 'true';
    elseif (is_string($data['marketing'])) $marketing = 'true';
}

$values = [
    $created_at,
    isset($data['email_cliente']) ? $data['email_cliente'] : '',
    isset($data['nome_cognome_cliente']) ? $data['nome_cognome_cliente'] : '',
    isset($data['cellulare_cliente']) ? $data['cellulare_cliente'] : '',
    isset($data['importo_mutuo']) ? $data['importo_mutuo'] : '',
    isset($data['valore_immobile']) ? $data['valore_immobile'] : '',
    isset($data['preferenza_contatto']) ? $data['preferenza_contatto'] : '',
    isset($data['consulente_euroansa']) ? $data['consulente_euroansa'] : '',
    isset($data['email_consulente_autorizzato']) ? $data['email_consulente_autorizzato'] : '', // Email consulente Hora
    isset($data['nome_cognome_consulente_autorizzato']) ? $data['nome_cognome_consulente_autorizzato'] : '', // Consulente Hora
    isset($data['note']) ? $data['note'] : '',
    $marketing,
    '', // Status (not provided by form)
    '', // MASSIMO FINANZIABILE (not provided by form)
    '', // NOTE EUROANSA (not provided by form)
];

$ok = addRowToSpreadsheet($GOOGLE_SHEET_ID, $values);
if ($ok) {
    echo json_encode([ 'ok' => true ]);
} else {
    http_response_code(500);
    echo json_encode([ 'ok' => false, 'error' => 'Write to Google Sheet failed' ]);
}


