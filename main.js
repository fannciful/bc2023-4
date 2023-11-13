const http = require('http');
const fs = require('fs');
const xml = require('fast-xml-parser');

//створення HTTP-сервера
const server = http.createServer((req, res) => {
  try {
    //читання XML-даних з файлу
    const xmlData = fs.readFileSync('data.xml', 'utf8');

    //перевірка чи не пустий файл
    if (!xmlData) {
      throw new Error('XML file is empty of not founded');
    }

    //опції для парсера XML
    const options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
    };

    //створення екземпляра парсера XML та аналіз XML-даних
    const parser = new xml.XMLParser(options);
    const obj = parser.parse(xmlData, options);

    //перевірка, чи маємо необхідні дані для обробки
    if (obj && obj.indicators && Array.isArray(obj.indicators.basindbank)) {
        //отримання та обробка даних
      const data = obj.indicators.basindbank;
      const sortedData = data
        .filter((item) => item.parent === 'BS3_BanksLiab')
        .map((item) => ({
          txten: item.txten,
          value: item.value,
        }));

        //створення нового об'єкта та XML-рядка
      const newObj = {
        data: {
          indicators: sortedData,
        },
      };

      //створення XML-рядка з новими об'єктом
      const builder = new xml.XMLBuilder();
      const xmlStr = builder.build(newObj);

      ////відправлення відповіді з XML-даними - успішний запит
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end(xmlStr);
    }
  } catch (error) {
    //обробка помилок та відправлення відповіді про помилку - статус помилки
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error: ' + error.message);
  }
});

//запуск сервера на localhost:8004
server.listen(8004, () => {
  console.log('Server is started on localhost:8004');
});



//XMLBuilder є класом, який дозволяє створювати XML-рядки на основі об'єктів JavaScript;
//XmlParser та XmlBuilder - це класи з бібліотеки 'fast-xml-parser', яка надає інструменти для
//роботи з XML в середовищі Node.js;
//XmlParser - клас, який служить для парсингу XML-даних