<?php
// mail.php

// Disabilita la visualizzazione degli errori in produzione
ini_set('display_errors', 0);
error_reporting(0);

// Imposta header per JSON
header('Content-Type: application/json; charset=utf-8');

// Definisci le costanti per il footer
define('OWNER_TITOLARE', 'Registro API');
define('OWNER_IND', 'Via Carlo Pisacane, 36 20129 Milano ');
define('OWNER_WEB', '<a href="https://www.registroapi.it">www.registroapi.it</a>');

// Funzione per inviare l'email
function fn_sendemail($to, $subject, $message)
{
    // Verifica se la funzione mail() è disponibile
    if (!function_exists('mail')) {
        return false;
    }

    $from = "noreply@registroapi.it";

    $headers = "From: " . $from . "\r\n";
    $headers .= "Reply-To: " . $from . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

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

    $message = "<html><body>" . $formatted_message . $footer . "</body></html>";

    try {
        // Prova a inviare l'email
        $result = @mail($to, $subject, $message, $headers);

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

// Controllo chiamata AJAX (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Sicurezza minima: pulizia dei dati
        $to = filter_var($_POST['to'] ?? '', FILTER_VALIDATE_EMAIL);
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if ($to && $subject && $message) {
            $success = fn_sendemail($to, $subject, $message);

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
