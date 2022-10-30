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

  money -= deposit;
  balance += deposit;

  balanceText.innerHTML = balance;
  moneyText.innerHTML = money;
});

// 거스름돈 반환 버튼
btnReturn.addEventListener("click", () => {
  if (balance === 0) {
    alert("잔액이 0원입니다");
    return;
  }

  money += balance;
  balance = 0;

  balanceText.innerHTML = balance;
  moneyText.innerHTML = money;
});

const listGot = document.querySelector(".list-got");

// Map 자료형 : {key, value}
// Map 자료형 - {key:음료의 id, value:음료의 정보}
const getMap = new Map();

// 획득 버튼
btnGet.addEventListener("click", () => {
  // 획득 버튼을 눌렀을때
  // 1. 획득한 음료에 처음 저장되는? 음료일때 => 아에 새로 추가를
  // 2. 이미 있는 음료일때 => 카운트만 올려주면 되고

  selectedList.forEach((item) => {
    if (getMap.has(item.id)) {
      getMap.get(item.id).count += item.count;
      console.log(getMap.get(item.id).count);
    } else {
      // 처음 저장될 때 - 문제 없음

      getMap.set(item.id, item);

      const liEl = document.createElement("li");

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
  });
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
const selectedList = [];

// 음료 클릭시 카트로 이동
listDrinks.addEventListener("click", () => {
  if (event.target.nodeName === "LI" || event.target.parentNode.nodeName === "LI") {
    const listSelect = document.querySelector(".list-select");

    let id = undefined;
    let target = undefined;

    if (event.target.nodeName === "LI") {
      target = event.target;
      id = event.target.getAttribute("data-id");
    } else if (event.target.parentNode.nodeName === "LI") {
      target = event.target.parentNode;
      id = event.target.parentNode.getAttribute("data-id");
    }
    
    
    // 품절 처리
    if (products[id].stock === 0) {
      alert("품절된 상품입니다.");
      return;
    }
    
    products[id].stock--;

    // 오류 : Cool_Cola & Orange_Cola 반영 안됨
    if (products[id].stock === 0) {
      target.classList.add("sold-out");
    }

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

      cartItems.forEach(item => {
        if (item.getAttribute("data-id") == selectedList[selectedListId].id) {
          selectedList[selectedListId].count++;
          item.querySelector("span").textContent = selectedList[selectedListId].count;
        }
      });

      // const cartList = document.querySelectorAll(".list-select li");
      // console.log(cartList);
      // selectedList[selectedListId].count++;
      // cartList.forEach((item) => {
      //   console.log("data-id", item.getAttribute("data-id"));
      //   console.log("selectedListId", selectedListId);
      //   if (item.getAttribute("data-id") == selectedListId) {
      //     console.log("dkdkdk");
      // const countSelected = document.querySelectorAll(
      //   ".list-select li span"
      // );
      // item.querySelectorAll("span").innerHTML = "dkdkdk";
      // }
      // });
    }
  }
});
