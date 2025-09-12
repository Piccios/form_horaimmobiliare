<?php
// mail.php

// Disabilita la visualizzazione degli errori in produzione (puoi alzare in dev)
ini_set('display_errors', 0);
error_reporting(0);

// Imposta header per JSON
header('Content-Type: application/json; charset=utf-8');

// Definisci le costanti per il footer (ADATTARE AL PROGETTO CORRENTE)
define('OWNER_TITOLARE', 'Hora Immobiliare');
define('OWNER_IND', '—');
define('OWNER_WEB', '<a href="https://horaimmobiliare.it/">www.horaimmobiliare.it</a>');
define('MAIL_ENDPOINT_URL', 'https://form-horaimmobiliare.vercel.app/mail.php');
define('LEADS_TO_EMAIL', 'lorenzo.picchi@euroansa.it');
define('LEADS_BCC_EMAIL', 'davide.acquafresca@euroansa.it');


// Funzione per inviare l'email
function fn_sendemail($to, $subject, $message, $attachments = [], $options = [])
{
    // Verifica se la funzione mail() è disponibile
    if (!function_exists('mail')) {
        return false;
    }

    // Mittente di default (ADATTARE AL PROGETTO CORRENTE)
    $from = "Consulenza Mutuo <noreply@horaimmobiliare.it>";

    $replyTo = isset($options['replyTo']) && filter_var($options['replyTo'], FILTER_VALIDATE_EMAIL) ? $options['replyTo'] : $from;
    $bcc = isset($options['bcc']) && filter_var($options['bcc'], FILTER_VALIDATE_EMAIL) ? $options['bcc'] : '';

    $headers = "From: " . $from . "\r\n";
    $headers .= "Reply-To: " . $replyTo . "\r\n";
    if (!empty($bcc)) {
        $headers .= "Bcc: " . $bcc . "\r\n";
    }
    $headers .= "MIME-Version: 1.0\r\n";
    $boundary = md5(uniqid(time()));
    if (!empty($attachments)) {
        $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
    } else {
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    }

    $footer = "<p style='margin-top:100px;'>
        ----------------------------------------<br />" .
        "<strong>" . OWNER_TITOLARE . "</strong><br />" .
        OWNER_IND . "<br />" .
        OWNER_WEB . "</p>";

    // Formatta il messaggio per renderlo più leggibile
    $formatted_message = str_replace(
        ['Nome:', 'Email:', 'Telefono:', 'Azienda:', 'Settore:', 'Messaggio:', 'Data:'],
        ['<strong>Nome:</strong>', '<strong>Email:</strong>', '<strong>Telefono:</strong>', '<strong>Azienda:</strong>', '<strong>Settore:</strong>', '<strong>Messaggio:</strong>', '<strong>Data:</strong>'],
        $message
    );


    $formatted_message = str_replace(
        ['Nome:', 'Email:', 'Telefono:', 'Azienda:', 'Settore:', 'Messaggio:', 'Data:'],
        ['<br/><strong>Nome:</strong>', '<br/><strong>Email:</strong>', '<br/><strong>Telefono:</strong>', '<br/><strong>Azienda:</strong>', '<br/><strong>Settore:</strong>', '<br/><strong>Messaggio:</strong>', '<br/><strong>Data:</strong>'],
        $formatted_message
    );

    $htmlBody = "<html><body>" . $formatted_message . $footer . "</body></html>";

    if (!empty($attachments)) {
        // Costruisci multipart/mixed
        $body  = "--$boundary\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $body .= $htmlBody . "\r\n";

        foreach ($attachments as $att) {
            $filename = isset($att['filename']) ? $att['filename'] : 'allegato.dat';
            $contentType = isset($att['contentType']) ? $att['contentType'] : 'application/octet-stream';
            $contentBase64 = isset($att['content']) ? $att['content'] : '';

            // Se content non è base64, prova a codificarlo
            if (strpos($contentBase64, '\n') === false && base64_decode($contentBase64, true) === false) {
                $contentBase64 = base64_encode($contentBase64);
            }

            $body .= "--$boundary\r\n";
            $body .= "Content-Type: $contentType; name=\"$filename\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n";
            $body .= "Content-Disposition: attachment; filename=\"$filename\"\r\n\r\n";
            $body .= chunk_split($contentBase64) . "\r\n";
        }

        $body .= "--$boundary--";
    } else {
        $body = $htmlBody;
    }

    try {
        // Prova a inviare l'email
        $result = @mail($to, $subject, $body, $headers);

        if ($result) {
            return true;
        } else {
            // In produzione, restituisci false se l'invio fallisce
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

// Controllo chiamata (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Supporta sia application/json sia form-url-encoded/multipart
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $rawInput = file_get_contents('php://input');
        $data = [];

        if (stripos($contentType, 'application/json') !== false) {
            $data = json_decode($rawInput, true) ?: [];
        } else {
            $data = $_POST;
        }

        // Pulizia dati
        $to = filter_var($data['to'] ?? '', FILTER_VALIDATE_EMAIL);
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');

        // Allegati opzionali: [{ filename, content, contentType }]
        $attachments = [];
        if (isset($data['attachments']) && is_array($data['attachments'])) {
            foreach ($data['attachments'] as $att) {
                if (!is_array($att)) continue;
                $attachments[] = [
                    'filename' => isset($att['filename']) ? $att['filename'] : 'allegato.dat',
                    'content' => isset($att['content']) ? $att['content'] : '',
                    'contentType' => isset($att['contentType']) ? $att['contentType'] : 'application/octet-stream',
                ];
            }
        }

        if ($to && $subject && $message) {
            $options = [];
            if (!empty($data['replyTo'])) {
                $options['replyTo'] = $data['replyTo'];
            }
            if (!empty($data['bcc'])) {
                // accetta stringa o array e usa il primo valore valido
                if (is_array($data['bcc'])) {
                    foreach ($data['bcc'] as $addr) {
                        if (filter_var($addr, FILTER_VALIDATE_EMAIL)) { $options['bcc'] = $addr; break; }
                    }
                } else if (is_string($data['bcc']) && filter_var($data['bcc'], FILTER_VALIDATE_EMAIL)) {
                    $options['bcc'] = $data['bcc'];
                }
            }

            $success = fn_sendemail($to, $subject, $message, $attachments, $options);

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Email inviata con successo']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Errore durante l\'invio dell\'email']);
            }
        } else {
            $errors = [];
            if (!$to)
                $errors[] = 'Email destinatario non valida';
            if (!$subject)
                $errors[] = 'Oggetto mancante';
            if (!$message)
                $errors[] = 'Messaggio mancante';

            echo json_encode(['success' => false, 'error' => 'Parametri mancanti o non validi: ' . implode(', ', $errors)]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Errore interno del server']);
    }
    exit;
}

// Se non è una richiesta POST, restituisci errore
echo json_encode(['success' => false, 'error' => 'Metodo non supportato']);
