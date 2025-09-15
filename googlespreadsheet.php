<?php

// Minimal bootstrap for Google Sheets API usage in this project
if (!function_exists('debug_log')) {
    function debug_log($message) {
        if (is_array($message) || is_object($message)) {
            $message = json_encode($message);
        }
        error_log('[gsheets] ' . $message);
    }
}

if (!function_exists('path_join')) {
    function path_join($base, $relative) {
        if ($relative === '' || $relative === null) return $base;
        $base = rtrim($base, "\\/\t\n\r\0\x0B");
        $relative = ltrim($relative, "\\/\t\n\r\0\x0B");
        return $base . DIRECTORY_SEPARATOR . $relative;
    }
}

if (!defined('BASE_DIR')) {
    define('BASE_DIR', __DIR__);
}

if (!defined('GOOGLE_APP_CREDENTIAL_FILE')) {
    // Prefer env var if provided; fallback to storage/google-service-account.json relative to project root
    $envCred = getenv('GOOGLE_APPLICATION_CREDENTIALS');
    define('GOOGLE_APP_CREDENTIAL_FILE', $envCred ? $envCred : 'storage/google-service-account.json');
}

// Composer autoload (google/apiclient)
$autoloadPath = path_join(BASE_DIR, 'vendor/autoload.php');
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    // Also try project root vendor when this file is included from public/api
    $altAutoload = path_join(path_join(BASE_DIR, '..'), 'vendor/autoload.php');
    if (file_exists($altAutoload)) {
        require_once $altAutoload;
    }
}

function addRowToSpreadsheet($fileId, $ary_values = array()) {

    // Set up the API
    $client = new Google_Client();
    $credPath = GOOGLE_APP_CREDENTIAL_FILE;
    // If a relative path was provided, resolve it from BASE_DIR
    if (strpos($credPath, DIRECTORY_SEPARATOR) !== 0 && !preg_match('/^[A-Za-z]:\\\\/', $credPath)) {
        $credPath = path_join(BASE_DIR, $credPath);
    }
    $client->setAuthConfig($credPath); // Service account JSON
    $client->addScope(Google_Service_Sheets::SPREADSHEETS);
    $sheet_service = new Google_Service_Sheets($client);

    $values = array();
    foreach( $ary_values AS $d ) {
        $cellData = new Google_Service_Sheets_CellData();
        $value = new Google_Service_Sheets_ExtendedValue();

        if(is_numeric($d)){
            $value->setNumberValue($d);
        } else {
            $value->setStringValue($d);
        } 
        
        $cellData->setUserEnteredValue($value);
        $values[] = $cellData;
    }

    // Build the RowData
    $rowData = new Google_Service_Sheets_RowData();
    $rowData->setValues($values);

    // Prepare the request
    $append_request = new Google_Service_Sheets_AppendCellsRequest();
    $append_request->setSheetId(0);
    $append_request->setRows($rowData);
    $append_request->setFields('userEnteredValue');
    
    // Set the request
    $request = new Google_Service_Sheets_Request();
    $request->setAppendCells($append_request);

    // Add the request to the requests array
    $requests = array();
    $requests[] = $request;
    
    // Prepare the update
    $batchUpdateRequest = new Google_Service_Sheets_BatchUpdateSpreadsheetRequest(array(
        'requests' => $requests
    ));


    if (addRowToSpreadsheet_update($sheet_service,$fileId,$batchUpdateRequest) === true)
        return true;
    else{
        debug_log('Visto che e andato male l\'inserimento ci riprovo aspettando due secondi');
        sleep(2);

        return addRowToSpreadsheet_update($sheet_service,$fileId,$batchUpdateRequest);
    }

    //unsed
    return false;
}

function addRowToSpreadsheet_update($sheet_service,$fileId,$batchUpdateRequest){

    try {
        // Execute the request
        $response = $sheet_service->spreadsheets->batchUpdate($fileId, $batchUpdateRequest);
        if( $response->valid() ) {
            debug_log('Nuova riga aggiunta correttamente al file ID:'.$fileId);
            return true;
        }
    } catch (Exception $e) {
        // Something went wrong
        debug_log('Eccezione:');
        debug_log($e->getMessage());
        return false;
    }
}