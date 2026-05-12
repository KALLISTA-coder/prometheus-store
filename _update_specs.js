const https = require('https');
const SUPABASE_URL = 'lrhdvpjddtaujcoriqgw.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyaGR2cGpkZHRhdWpjb3JpcWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NDk4MCwiZXhwIjoyMDkxODIwOTgwfQ.iL232SqhiAQknnY4fthotVHfl2TRZzJF7GwDJO3odEY';

function patch(id, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: SUPABASE_URL,
      path: `/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
      method: 'PATCH',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`[${id}] Status: ${res.statusCode}`);
        if (d) console.log(`  Response: ${d}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Mic 1: tripod version
  await patch('p-1777709569763', {
    specs: [
      { label: "Тип", value: "Конденсаторный USB" },
      { label: "Направленность", value: "Кардиоидная" },
      { label: "Частотный диапазон", value: "20 Гц – 20 кГц" },
      { label: "Подключение", value: "USB Type-C" },
      { label: "Корпус", value: "Металлический" },
      { label: "Подсветка", value: "RGB (переключаемая)" },
      { label: "Регулятор громкости", value: "На корпусе" },
      { label: "Совместимость", value: "ПК, ноутбук, смартфон (OTG)" },
      { label: "Комплект", value: "Микрофон + штатив + поп-фильтр + кабель USB-C/A + OTG" },
      { label: "Вес", value: "~350 г" }
    ],
    specs_en: [
      { label: "Type", value: "USB Condenser" },
      { label: "Polar Pattern", value: "Cardioid" },
      { label: "Frequency Range", value: "20 Hz – 20 kHz" },
      { label: "Connection", value: "USB Type-C" },
      { label: "Body", value: "Metal" },
      { label: "Lighting", value: "RGB (switchable)" },
      { label: "Volume Control", value: "On body" },
      { label: "Compatibility", value: "PC, laptop, smartphone (OTG)" },
      { label: "Kit", value: "Mic + tripod + pop-filter + USB-C/A cable + OTG" },
      { label: "Weight", value: "~350 g" }
    ]
  });

  // Mic 2: pantograph version
  await patch('p-1777710062211', {
    specs: [
      { label: "Тип", value: "Конденсаторный USB" },
      { label: "Направленность", value: "Кардиоидная" },
      { label: "Частотный диапазон", value: "20 Гц – 20 кГц" },
      { label: "Подключение", value: "USB Type-C" },
      { label: "Корпус", value: "Металлический" },
      { label: "Подсветка", value: "RGB (переключаемая)" },
      { label: "Крепление", value: "Пантограф (студийный)" },
      { label: "Регулятор громкости", value: "На корпусе" },
      { label: "Совместимость", value: "ПК, ноутбук, смартфон (OTG)" },
      { label: "Комплект", value: "Микрофон + пантограф + поп-фильтр + кабель USB-C/A + OTG" },
      { label: "Вес", value: "~350 г (микрофон)" }
    ],
    specs_en: [
      { label: "Type", value: "USB Condenser" },
      { label: "Polar Pattern", value: "Cardioid" },
      { label: "Frequency Range", value: "20 Hz – 20 kHz" },
      { label: "Connection", value: "USB Type-C" },
      { label: "Body", value: "Metal" },
      { label: "Lighting", value: "RGB (switchable)" },
      { label: "Mount", value: "Pantograph (studio)" },
      { label: "Volume Control", value: "On body" },
      { label: "Compatibility", value: "PC, laptop, smartphone (OTG)" },
      { label: "Kit", value: "Mic + pantograph + pop-filter + USB-C/A cable + OTG" },
      { label: "Weight", value: "~350 g (mic)" }
    ]
  });

  console.log('Done!');
}

main().catch(console.error);
