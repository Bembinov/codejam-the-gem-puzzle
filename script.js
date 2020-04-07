let seconds = 0;
let minutes = 0;
let gameIsOn = false;
let size = 4;

const createCell = (order, i) => {
  const cell = document.createElement('div');
  const span = document.createElement('span');
  cell.classList.add('cell');
  cell.style.setProperty('order', order);
  span.classList.add('cell__content');
  span.innerHTML = i;
  cell.appendChild(span);
  return cell;
};

const swapElements = (node1, node2, axis) => {
  const moves = document.querySelector('.status__moves');
  const count = moves.innerHTML.split(' ')[1];
  moves.innerHTML = `Ходов: ${+count + 1}`;
  const firstOrder = parseInt(node1.style.order);
  const secondOrder = parseInt(node2.style.order);
  document.querySelector('.gameboard').classList.toggle('transit');
  firstOrder + ' ' + secondOrder;
  if (firstOrder < secondOrder) {
    node1.style.transform = `translate${axis}(${node1.offsetWidth}px)`;
    node2.style.transform = `translate${axis}(${-node1.offsetWidth}px)`;
  } else {
    node1.style.transform = `translate${axis}(${-node1.offsetWidth}px)`;
    node2.style.transform = `translate${axis}(${node1.offsetWidth}px)`;
  }
  setTimeout(() => {
    document.querySelector('.gameboard').classList.toggle('transit');
    node1.style.transform = ``;
    node2.style.transform = ``;
    const temp = node1.style.order;
    node1.style.order = node2.style.order;
    node2.style.order = temp;
    const scoreArr = Array.from(document.querySelector('.gameboard').childNodes)
      .sort((a, b) => +a.style.order - b.style.order)
      .map((el) => el.childNodes[0].innerHTML);
    scoreArr.pop();
    scoreArr;
    if (scoreArr.every((el, i) => +el === i + 1)) {
      const message = `Время ${minutes}:${seconds} и ${count} ходов`;
      createPopUp(`Ура! Вы решили головоломку за ${minutes}:${seconds} и ${count} ходов`);
      const topScore = localStorage.getItem('top') ? localStorage.getItem('top').split(',') : [];
      topScore.push(message);
      localStorage.setItem('top', topScore);
    }
  }, 500);
};

const clickHandler = (event, size) => {
  gameIsOn = true;
  if (event.target.classList[1] == 'empty') return;
  const empty = document.querySelector('.empty');
  const eventOrder = parseInt(event.target.style.order);
  const emptyOrder = parseInt(empty.style.order);
  if (Math.abs(emptyOrder - eventOrder) == size) {
    swapElements(event.target, empty, 'Y');
    return;
  } else if (
    Math.abs(emptyOrder - eventOrder) === 1 &&
    Math.floor((emptyOrder - 1) / size) === Math.floor((eventOrder - 1) / size)
  )
    swapElements(event.target, empty, 'X');
};

const timer = setInterval(() => {
  if (gameIsOn) {
    const time = document.querySelector('.status__time');
    seconds++;
    time.innerHTML = `Время: ${minutes}:${seconds}`;
    if (seconds == 60) {
      minutes += 1;
      seconds = 0;
    }
  }
}, 1000);

const saveSession = () => {
  const sessionArr = Array.from(document.querySelector('.gameboard').childNodes)
    .sort((a, b) => +a.style.order - b.style.order)
    .map((el) => el.childNodes[0].innerHTML);
  const sessionTime = [minutes, seconds];
  const sessionMoves = document.querySelector('.status__moves').innerHTML.split(' ')[1];
  localStorage.setItem('sessionTime', sessionTime);
  localStorage.setItem('sessionMoves', sessionMoves);
  localStorage.setItem('sessionArr', sessionArr);
  localStorage.setItem('sessionSize', size);
};

const createPopUp = (message) => {
  const popUp = document.createElement('div');
  const res = document.createElement('div');
  const paragraph = document.createElement('p');
  paragraph.innerHTML = message;
  popUp.classList.add('popUp');

  res.classList.add('popUp__results');
  res.appendChild(paragraph);
  popUp.appendChild(res);
  document.body.appendChild(popUp);
  popUp.addEventListener('click', () => {
    document.body.removeChild(popUp);
    stopHandler();
  });
};

const showRes = () => {
  if (gameIsOn) stopHandler();
  const topScore = localStorage.getItem('top') ? localStorage.getItem('top').split(',') : false;
  if (!topScore)
    createPopUp(
      'У вас нет побед!<br>P.S. Для проверяющего - можно на странице изменить значение span элементов, чтобы оно совпадало с order, чтобы проверить верность алгоритма'
    );
  else {
    topScore.sort((a, b) => a.split('.')[1] - b.split('.')[1]);
    topScore;
    const message = topScore.map((el, i) => `${i + 1}.${el.split('.')[0]}<br>`).join('');
    message;
    createPopUp(message);
  }
};

const createBoard = (event) => {
  const gameSection = document.querySelector('aside');
  gameSection.innerHTML = '';
  minutes = 0;
  seconds = 0;
  const moves = document.querySelector('.status__moves');
  if ((event && event.target === document.querySelector('.btn_start')) || typeof event === 'number')
    localStorage.clear();
  if (localStorage.getItem('sessionTime')) {
    const sessionTime = localStorage.getItem('sessionTime').split(',');
    minutes = sessionTime[0];
    seconds = sessionTime[1];
    document.querySelector(
      '.status__time'
    ).innerHTML = `Время: ${sessionTime[0]}:${sessionTime[1]}`;
    moves.innerHTML = `Ходов: ${localStorage.getItem('sessionMoves')}`;
    size = localStorage.getItem('sessionSize');
  } else {
    document.querySelector('.status__time').innerHTML = `Время: ${0}:${0}`;
    moves.innerHTML = 'Ходов: 0';
  }

  const div = document.createElement('div');
  div.classList.add('gameboard');
  div.classList.add(`gameboard_${size}`);
  div.addEventListener('click', (event) => clickHandler(event, size));
  let randomNums = [];
  for (let i = 1; i < size ** 2; i++) {
    randomNums.push(i);
  }
  randomNums.sort(() => Math.random() - 0.5);
  randomIndex = Math.floor(Math.random() * randomNums.length);

  if (localStorage.getItem('sessionArr') && !event) {
    randomNums = localStorage.getItem('sessionArr').split(',');
    randomIndex = randomNums.indexOf(' ');
    randomNums.splice(randomIndex, 1);
  }
  for (let i = 0; i < randomNums.length; i++) {
    const cell =
      i < randomIndex ? createCell(i + 1, randomNums[i]) : createCell(i + 2, randomNums[i]);
    div.appendChild(cell);
    if (i == randomIndex) {
      const emptyCell = createCell(i + 1, ' ');
      emptyCell.classList.add('empty');
      div.appendChild(emptyCell);
    }
  }
  gameSection.appendChild(div);
  if (event && event.target === document.querySelector('.btn_start') && !gameIsOn) stopHandler();
  gameIsOn = true;
};

const stopHandler = () => {
  gameIsOn = !gameIsOn;
  let stopButton = document.querySelector('.btn_stop');
  if (gameIsOn) {
    stopButton.innerHTML = 'Стоп';
    document.querySelector('.gameboard').classList.remove('off');
    ('STOP');
  } else {
    stopButton.innerHTML = 'Продолжить';
    document.querySelector('.gameboard').classList.add('off');
  }
};

const createMenu = () => {
  const nav = document.createElement('nav');
  const list = document.createElement('ul');
  const statusBar = document.createElement('div');
  const listArr = [];
  for (let i = 0; i < 4; i++) listArr.push(document.createElement('li'));
  nav.classList.add('nav');
  list.classList.add('nav__list');
  statusBar.classList.add('nav__status');

  listArr[0].innerHTML = 'Перемешать и Начать';
  listArr[0].classList.add('btn_start');
  listArr[1].innerHTML = 'Стоп';
  listArr[1].classList.add('btn_stop');
  listArr[2].innerHTML = 'Сохранить';
  listArr[2].classList.add('btn_save');
  listArr[3].innerHTML = 'Результаты';
  listArr[3].classList.add('btn_res');
  listArr.forEach((el) => list.appendChild(el));

  const moves = document.createElement('span');
  moves.innerHTML = 'Ходов: 0';

  moves.classList.add('status__moves');
  const time = document.createElement('span');
  time.classList.add('status__time');
  time.innerHTML = 'Время: 0:0';
  statusBar.appendChild(moves);
  statusBar.appendChild(time);

  nav.appendChild(list);
  nav.appendChild(statusBar);
  return nav;
};

const changeSize = (event) => {
  size = parseInt(event.target.value);
  createBoard(size);
};

const sizeOptions = () => {
  const div = document.createElement('div');
  const buttons = [];
  for (let i = 0; i < 6; i++) buttons.push(document.createElement('button'));
  div.classList.add('options');
  buttons.forEach((el, i) => {
    const button = el;
    button.value = +i + 3;
    button.innerHTML = `${i + 3}x${i + 3}`;
    button.classList.add('options__btn');
    div.appendChild(button);
  });
  div.addEventListener('click', changeSize);
  return div;
};

const start = () => {
  const main = document.createElement('main');
  const nav = createMenu();
  const gameSection = document.createElement('aside');
  const sizeMenu = sizeOptions();
  main.classList.add('main');
  nav.classList.add('nav');
  main.appendChild(nav);
  main.appendChild(gameSection);
  main.appendChild(sizeMenu);
  document.body.appendChild(main);
  createBoard();
  document.querySelector('.btn_start').addEventListener('click', (event) => createBoard(event));
  document.querySelector('.btn_stop').addEventListener('click', stopHandler);
  document.querySelector('.btn_save').addEventListener('click', saveSession);
  document.querySelector('.btn_res').addEventListener('click', showRes);
};

start();
