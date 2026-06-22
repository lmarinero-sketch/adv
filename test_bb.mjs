const bbUrl = "https://app.builderbot.cloud/api/v2";
const bbKey = "bb-5f5e9f11-4655-408c-aba1-5a993c1aa6e1";
const bbBotId = "fa354b20-5d73-4c5c-95ab-d03d8f314fcb";

async function test() {
  const endpoint = `${bbUrl}/${bbBotId}/messages`;
  console.log("Sending to:", endpoint);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-builderbot': bbKey },
      body: JSON.stringify({ 
        number: "5492645438114", 
        checkIfExists: false,
        messages: { content: "¡Hola! Esta es una prueba de sistema del nuevo CRM de Adventure Pro. Foxy está evaluando la conexión saliente." } 
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
test();
