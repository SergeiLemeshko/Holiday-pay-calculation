//780 000 - 1, 560 000 - 2, 960 0000 - 3

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const calculateButton = document.getElementById('calculateButton');
  const outputDiv = document.getElementById('output');
  let names = []; //Ф.И.О. каждого сотрудника
  let total = []; //общая зар. плата каждого сотрудника
  let chunkedArray = null;

  calculateButton.addEventListener('click', calculateVacation);

  function calculateVacation() {
    const file = fileInput.files[0];
    if (!file) {
      console.log('Please select a file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      chunkedArray = splitArrayIntoChunks(jsonData, 12); //разделенные массивы

      retTotal(chunkedArray);
      displayResults(names, total);
    };
    reader.readAsArrayBuffer(file);
    // displayResults(names, total);
  }

    //делим общий массив объектов на отдельные массивы по сотрудникам
    function splitArrayIntoChunks(array, chunkSize) {
      let chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        names.push(array[i]['ФИО']); // Ф.И.О. каждого сотрудника
        chunks.push(array.slice(i, i + chunkSize));
      }
      // displayResults(names, total);
      return chunks;
    }

    function retTotal(arr) {
      for (const person of arr) {
        if(Array.isArray(person)) {
          //рассчитываем общую зар. плату каждого сотрудника
          let sum = person.reduce((acc, obj) => acc + obj['ЗП'], 0);
          total.push(sum);
        }
      }
    }

  function displayResults(names, zarpl) {
    // if(names.length === 0 && zarpl.length === 0) return;
    console.log(names.length, zarpl.length, "kkkk");
    outputDiv.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = table.insertRow();//строка
    const headers = ['Ф.И.О', 'Общий заработок', 'Размер отпускных'];

    //заголовки
    for (const header of headers) {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    }

    let keys = names;
    let values = zarpl;
    let obj = Object.fromEntries(keys.map((key, index) => [key, values[index]]));

    for (let el in obj) {
      console.log(obj[el], 'el');
      const row = table.insertRow();
      const fullNameCell = row.insertCell();
      const salaryCell = row.insertCell();
      const vacationSizeCell = row.insertCell();

      fullNameCell.textContent = el;
      salaryCell.textContent = obj[el];
      vacationSizeCell.textContent = ((obj[el] / 247) * 28).toFixed(1);
    }

    outputDiv.appendChild(table);
  }
});

