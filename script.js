// DOM 접근
const balanceText = document.querySelector("#balance-text");
const moneyText = document.querySelector("#money-text");
const totalMoneyText = document.querySelector("#total-money-text");
const btnInput = document.querySelector(".btn-input");
const btnReturn = document.querySelector(".btn-return");
const btnGet = document.querySelector(".btn-get");
const inpMoney = document.querySelector(".inp-money");

// 초깃값 설정
let balance = 50000;
let money = 50000;
let totalMoney = 0;

balanceText.textContent = balance;
moneyText.textContent = money;
totalMoneyText.textContent = totalMoney;

// 입금 버튼
btnInput.addEventListener("click", () => {
  const deposit = parseInt(inpMoney.value);
  console.log(deposit);
  if (deposit > money) {
    alert("소지금이 부족합니다.");
    return;
  } else if (isNaN(deposit)) {
    alert("숫자를 입력해주세요.");
    return;
  } else if (deposit <= 0) {
    alert("1원 이상의 금액을 입력해주세요.");
    return;
  }

  inpMoney.value = "";
  inpMoney.focus();

  money -= deposit;
  balance += deposit;

  balanceText.innerHTML = balance;
  moneyText.innerHTML = money;
});

// 거스름돈 반환 버튼
btnReturn.addEventListener("click", () => {
  if (balance === 0) {
    alert("잔액이 0원입니다.");
    return;
  }

  money += balance;
  balance = 0;

  balanceText.innerHTML = balance;
  moneyText.innerHTML = money;
});

// JSON 데이터로 음료 리스트 받아오기
let originalProducts = [];
let products = [];
const listDrinks = document.querySelector(".list-drinks");

async function getProducts() {
  let response = await fetch("./assets/products.json");
  originalProducts = await response.json();
  products = [...originalProducts];
  return products;
}

getProducts()
  .then((products) => {
    products.forEach((item) => {
      item["count"] = 0;
    });
    return products;
  })
  .then((products) => {
    products.forEach((item) => {
      const liEl = document.createElement("li");
      liEl.setAttribute("data-id", item.id);
      const imgEl = document.createElement("img");
      imgEl.classList.add("img-cola");
      imgEl.setAttribute("src", item.photo);
      liEl.appendChild(imgEl);

      const txtEl = document.createTextNode(item.title);
      liEl.appendChild(txtEl);

      const divEl = document.createElement("div");
      divEl.classList.add("price");
      divEl.innerHTML = item.price;
      liEl.appendChild(divEl);

      listDrinks.appendChild(liEl);
    });
  })
  .catch((error) => {
    console.error(error);
    alert("페이지에 문제가 발생했습니다.");
  });

const colaList = document.querySelectorAll(".list-drink li");
let selectedList = [];
const listSelect = document.querySelector(".list-select");
let id = undefined;

// 음료 클릭시 카트로 이동
listDrinks.addEventListener("click", () => {
  // 품절 처리
  if (event.target.nodeName === "LI") {
    id = event.target.getAttribute("data-id");
    if (products[id].stock === 0) {
      event.target.classList.add("sold-out");
    }
  } else if (event.target.parentNode.nodeName === "LI") {
    id = event.target.parentNode.getAttribute("data-id");
    if (products[id].stock === 0) {
      event.target.parentNode.classList.add("sold-out");
    }
  }

  if (products[id].stock === 0) {
    alert("품절된 상품입니다.");
    return;
  }

  if (
    event.target.nodeName === "LI" ||
    event.target.parentNode.nodeName === "LI"
  ) {
    const listSelect = document.querySelector(".list-select");
    let id = undefined;
    if (event.target.nodeName === "LI") {
      id = event.target.getAttribute("data-id");
    } else if (event.target.parentNode.nodeName === "LI") {
      id = event.target.parentNode.getAttribute("data-id");
    }

    products[id].stock--;

    // 잔액 부족 처리
    if (products[id].price > balance) {
      alert("잔액이 부족합니다.");
      return;
    }

    balance -= products[id].price;
    balanceText.textContent = balance;

    const selectedListId = selectedList.findIndex((item) => item.id === id);

    // 음료를 처음 선택했을 때
    if (selectedListId === -1) {
      selectedList.push({
        id: id,
        title: products[id].title,
        photo: products[id].photo,
        price: products[id].price,
        count: 1,
      });

      const liEl = document.createElement("li");
      liEl.setAttribute("data-id", id);

      const imgEl = document.createElement("img");
      imgEl.setAttribute("src", products[id].photo);
      liEl.appendChild(imgEl);

      const textEl = document.createTextNode(products[id].title);
      liEl.appendChild(textEl);

      const spanEl = document.createElement("span");
      spanEl.textContent = 1;

      liEl.appendChild(spanEl);

      listSelect.appendChild(liEl);
    } else {
      // 음료를 중복 선택했을 때

      const cartItems = listSelect.querySelectorAll(`.list-select li`);

      cartItems.forEach((item) => {
        if (item.getAttribute("data-id") == selectedList[selectedListId].id) {
          selectedList[selectedListId].count++;
          item.querySelector("span").textContent =
            selectedList[selectedListId].count;
        }
      });
    }
  }
});

const listGot = document.querySelector(".list-got");

// Map 자료형 : {key, value}
// Map 자료형 - {key:음료의 id, value:음료의 정보}
const getMap = new Map();

// 획득 버튼
btnGet.addEventListener("click", () => {
  // 획득 버튼을 눌렀을때
  // 1. 획득한 음료에 처음 저장되는? 음료일때 => 아예 새로 추가를
  // 2. 이미 있는 음료일때 => 카운트만 올려주면 되고
  // 3. 카트에 음료가 없을 때 => 오류 메시지 출력

  if (selectedList.length === 0) {
    alert("카트에 음료가 없습니다.");
  }

  selectedList.forEach((item) => {
    if (getMap.has(item.id)) {
      // 오류 수정 필요
      getMap.get(item.id).count += item.count;
      const listGotItem = listGot.querySelector(
        `li[data-id = '${item.id}'] span`
      );
      listGotItem.textContent = getMap.get(item.id).count;
    } else {
      // 처음 저장될 때 - 문제 없음

      getMap.set(item.id, item);

      const liEl = document.createElement("li");
      liEl.setAttribute("data-id", id);

      const imgEl = document.createElement("img");
      imgEl.setAttribute("src", item.photo);
      liEl.appendChild(imgEl);

      const textEl = document.createTextNode(item.title);
      liEl.appendChild(textEl);

      const spanEl = document.createElement("span");
      spanEl.textContent = item.count;

      liEl.appendChild(spanEl);

      listGot.appendChild(liEl);
    }

    // 가격 누적
    totalMoney += item.price * item.count;
    totalMoneyText.textContent = totalMoney;
  });

  // 카트 비우기
  selectedList = [];
  listSelect.innerHTML = "";
});
