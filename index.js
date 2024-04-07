class SalaryCalculator {
  constructor() {
    this.fileInput = document.querySelector('.input-file__add');
    this.calculateButton = document.querySelector('.button');
    this.outputDiv = document.getElementById('output');
    this.inputText = document.querySelector('.input-file__text');
    this.btnClear = document.querySelector('.btn-clear');
    this.names = []; //массив Ф.И.О. каждого сотрудника
    this.totalSalary = []; //массив общей ЗП каждого сотрудника
    this.chunkedArray = []; // массивы с информацией по каждому сотруднику

    this.fileInput.addEventListener('input', this.showFileText.bind(this));
    this.btnClear.addEventListener('click', this.clearPage.bind(this));
    this.calculateButton.addEventListener('click', this.getData.bind(this));
  }

  //показывает имя выбранного файла
  showFileText() {
    this.inputText.innerHTML = this.fileInput.files[0].name;
  }
  //получает данные, делит на массивы по сотрудникам, предупреждает, если не выбран файл
  getData() {
    const file = this.fileInput.files[0];
    if (!file) {
      // Добавляем предупреждение на страницу
      this.showWarning('Пожалуйста, выберите файл!');
      return;
    } 

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      this.chunkedArray = this.splitArrayIntoChunks(jsonData, 12); //разделенные массивы
      this.getTotal(this.chunkedArray);
      this.displayResults(this.names, this.totalSalary);
    };
    reader.readAsArrayBuffer(file);
  }
  //делит общий массив объектов на отдельные массивы по сотрудникам
  splitArrayIntoChunks(array, chunkSize) {
    let chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      this.names.push(array[i]['ФИО']); // пушим в names Ф.И.О. каждого сотрудника
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  //рассчитывает общую ЗП каждого сотрудника
  getTotal(arr) {
    for (const person of arr) {
      if(Array.isArray(person)) {
        let sum = person.reduce((acc, obj) => acc + obj['ЗП'], 0);
        this.totalSalary.push(sum);
      }
    }
  }
  //показывает результат в виде таблицы
  displayResults(names, salary) {
    this.outputDiv.innerHTML = '';

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
    this.outputDiv.appendChild(table);
    this.btnClear.style.opacity = '1';
  }
  // Добавляем текст предупреждения, если не выбран файл
  showWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.classList.add('warning');
    warningDiv.textContent = message;
      // Чистим текст предупреждения через 1 секунду
      setTimeout(() => {
        warningDiv.textContent = '';
      }, 1000);
    // Добавляем предупреждение на страницу
    this.inputText.insertAdjacentElement('afterEnd', warningDiv);
  }
  //чистит выбранный файл и таблицу
  clearPage() {
    this.outputDiv.innerHTML = '';
    this.inputText.innerHTML = '';
    this.btnClear.style.opacity = '0';
    this.fileInput.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SalaryCalculator();
});
