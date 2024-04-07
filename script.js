document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.querySelector('.input-file__add');
  const calculateButton = document.querySelector('.button');
  const outputDiv = document.getElementById('output');
  const inputText = document.querySelector('.input-file__text');
  const btnClear = document.querySelector('.btn-clear');
  let names = []; //массив Ф.И.О. каждого сотрудника
  let totalSalary = []; //массив общей ЗП каждого сотрудника
  let chunkedArray = []; // массивы с информацией по каждому сотруднику

  //показывает имя выбранного файла
  function showFileText() {
    inputText.innerHTML = fileInput.files[0].name;
  };

  //вешаем слушатель на получение названия загружаемого файла
  fileInput.addEventListener('input', showFileText);
  //вешаем слушатель на кнопку очистки
  btnClear.addEventListener('click', clearPage);

  //получает данные, делит на массивы по сотрудникам, предупреждает, если не выбран файл
  function getData() {
    const file = fileInput.files[0];
    if (!file) {
      // Добавляем текст предупреждения, если не выбран файл
      const warningDiv = document.createElement('div');
      warningDiv.classList.add('warning');
      warningDiv.textContent = 'Пожалуйста, выберите файл!';
      // Чистим текст предупреждения через 1 секунду
      setTimeout(() => {
        warningDiv.textContent = '';
      }, 1000);
      // Добавляем предупреждение на страницу
      inputText.insertAdjacentElement('afterEnd', warningDiv);
      return;
    } 

    const reader = new FileReader();

    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      chunkedArray = splitArrayIntoChunks(jsonData, 12); //разделенные массивы

      getTotal(chunkedArray);
      displayResults(names, totalSalary);
    };
    reader.readAsArrayBuffer(file);
  };

  //вешаем на кнопку "Рассчитать" слушатель события click
  calculateButton.addEventListener('click', getData);

  //делит общий массив объектов на отдельные массивы по сотрудникам
  function splitArrayIntoChunks(array, chunkSize) {
    let chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      names.push(array[i]['ФИО']); // пушим в names Ф.И.О. каждого сотрудника
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  //рассчитывает общую ЗП каждого сотрудника
  function getTotal(arr) {
    for (const person of arr) {
      if(Array.isArray(person)) {
        let sum = person.reduce((acc, obj) => acc + obj['ЗП'], 0);
        totalSalary.push(sum);
      }
    }
  };

  //показывает результат в виде таблицы
  function displayResults(names, salary) {
    outputDiv.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('table');
    const headerRow = table.insertRow(); //строка
    const headers = ['Ф.И.О', 'Общий заработок', 'Размер отпускных'];

    //заголовки таблицы
    for (const header of headers) {
      const th = document.createElement('th');
      th.classList.add('th');
      th.textContent = header;
      headerRow.appendChild(th);
    }

    //создаём объект, где ключи - Ф.И.О., значения - ЗП, чтобы отобразить в таблице
    let createObj = Object.fromEntries(names.map((key, index) => [key, salary[index]]));

    for (let el in createObj) {
      const row = table.insertRow();
      const fullNameCell = row.insertCell(); //ячейки Ф.И.О.
      const salaryCell = row.insertCell(); //ячейки ЗП
      const vacationSizeCell = row.insertCell(); //ячейки размера отпускных

      //заполняем ячейки данными
      fullNameCell.textContent = el;
      salaryCell.textContent = createObj[el];
      //общий доход делим на кол-во рабочих дней(взял среднее - 247 рабочих дней за 1 год) и умножаем на 28 дней отпуска
      vacationSizeCell.textContent = ((createObj[el] / 247) * 28).toFixed(1);
    }
    //вставляем готовую таблицу и показываем кнопку "Очистить"
    outputDiv.appendChild(table);
    btnClear.style.opacity = '1';
  };

  //чистит выбранный файл и таблицу
  function clearPage() {
    outputDiv.innerHTML = '';
    inputText.innerHTML = '';
    btnClear.style.opacity = '0';
    fileInput.value = ''; //чистим выбранный файл
  };
});