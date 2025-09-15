// Test script per verificare l'endpoint localmente
import fetch from 'node-fetch';

async function testEndpoint() {
  try {
    console.log('Testing endpoint...');
    
    const testData = {
      email_cliente: 'test@example.com',
      nome_cognome_cliente: 'Mario Rossi',
      cellulare_cliente: '1234567890',
      importo_mutuo: '200000',
      valore_immobile: '300000',
      preferenza_contatto: 'telefono',
      consulente_euroansa: 'Mario Bianchi',
      email_consulente_autorizzato: 'mario.bianchi@euroansa.com',
      nome_cognome_consulente_autorizzato: 'Mario Bianchi',
      note: 'Test note',
      marketing: true,
      privacy_consent: true,
      honeypot_passed: true,
      created_at: new Date().toISOString(),
      source_page: '/test',
      language: 'it'
    };

    const response = await fetch('https://form-horaimmobiliare.vercel.app/api/send-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoint();
