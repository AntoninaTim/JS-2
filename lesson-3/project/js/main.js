const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class ProductList {
  constructor(url, container, list = listContext) {
    this.container = container;
    this.goods = [];
    this.allProducts = [];
    this.url = url;
    this.list = list;
    this.filtered = []; // отфильтрованные товары
    this._init();
  }

  getJson(url){
    return fetch(url ? url : `${API + this.url}`)
      .then(result => result.json())
      .catch(error => {
        console.log(error);
      })
  }

  handleData(data){
    this.goods = [...data];
    this.render();
  }
  
/*Подсчет стоимости товаров*/
  goodsTotalPrice() {
    return this.goods.reduce((sum, { price }) => sum + price, 0);
  }
  render() {
    const block = document.querySelector(this.container);
    this.goods.forEach((product) => {
      const productObject = new ProductItem(product);
      console.log(productObject);
      this.allProducts.push(productObject);
      block.insertAdjacentHTML('beforeend', productObject.render());
    });
  }
}

/*Поиск товаров*/

filter(value){
  const regexp = new RegExp(value, 'i');
  this.filtered = this.allProducts.filter(product => regexp.test(product.name));
  this.allProducts.forEach(product => {
    const block = document.querySelector(`.product-item[data-id="${product.id}"]`);
    if (!this.filtered.includes(product)) {
      block.classList.add('invisible');
    } else {
      block.classList.remove('invisible');
    }
  })
}
_init()
  return false

class ProductItem {
  constructor(product, img='https://placehold.it/200x150') {
    this.name = product.name;
    this.price = product.price;
    this.id = product.id;
    this.img = img;
  }

render() {
    return `<div class="product-item" data-id="${this.id}">
              <img src="${this.img}" alt="Some img">
              <div class="desc">
                  <h3>${this.title}</h3>
                  <p>${this.price} \u20bd</p>
                  <button class="buy-btn">Купить</button>
              </div>
          </div>`;
  }
}

class List extends ProductList{
  constructor(cart, container = '.products', url = "/catalogData.json"){
    super(url, container);
    this.cart = cart;
    this.getJson()
      .then(data => this.handleData(data));
  }

  _init(){
    document.querySelector(this.container).addEventListener('click', event => {
      if(event.target.classList.contains('buy-btn')){
        this.cart.addProduct(event.target);
      }
    });
    document.querySelector('.search-form').addEventListener('submit', event => {
      event.preventDefault();
      this.filter(document.querySelector('.search-field').value)
    })
  }
}

class Item extends ProductItem{
  render() {
    return `<div class="product-item" data-id="${this.id}">
                <img src="${this.img}" alt="Some img">
                <div class="desc">
                    <h3>${this.name}</h3>
                    <p>${this.price} ₽</p>
                    <button class="buy-btn"
                    data-id="${this.id}"
                    data-name="${this.name}"
                    data-price="${this.price}">Купить</button>
                </div>
            </div>`;
  }
}
///////////////////////////////////////////////////

//Создаем класс корзина Cart
class Cart extends ProductList{
  constructor(container = ".cart-block", url = "/getBasket.json"){
    super(url, container);
    this.getJson()
      .then(data => {
        this.handleData(data.contents);
      });
  }
  
  //метод добавления товара в корзину
  addToCart(element){
    this.getJson(`${API}/addToBasket.json`)
      .then(data => {
        if(data.result === 1){
          let productId = +element.dataset['id'];
          let find = this.allProducts.find(product => product.id === productId);
          if(find){
            find.quantity++;
            this._updateCart(find);
          } else {
            let product = {
              id: productId,
              price: +element.dataset['price'],
              name: element.dataset['name'],
              quantity: 1
            };
            // goods - это своего рода "опорный" массив, отражающий список товаров, которые нужно отрендерить.
            // При добавлении нового товара, нас интересует только он один.
            this.goods = [product];
            // далее вызывая метод render, мы добавим в allProducts только его, тем самым избегая лишнего перерендера.
            this.render();
          }
        } else {
          alert('Error');
        }
      })
  }

  
  //метод удаления товара из корзины
  removeFromCart(element){
    this.getJson(`${API}/deleteFromBasket.json`)
      .then(data => {
        if(data.result === 1){
          let productId = +element.dataset['id'];
          let find = this.allProducts.find(product => product.id === productId);
          if(find.quantity > 1){ // если товара > 1, то уменьшаем количество на 1
            find.quantity--;
            this._updateCart(find);
          } else { // удаляем
            this.allProducts.splice(this.allProducts.indexOf(find), 1);
            document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
          }
        } else {
          alert('Error');
        }
      })
  }

  
  /*обновляем данные корзины*/
  
  _updateCart(product){
    let block = document.querySelector(`.cart-item[data-id="${product.id}"]`);
    block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
    block.querySelector('.product-price').textContent = `${product.quantity * product.price} ₽`;
  }
  _init(){
    document.querySelector('.btn-cart').addEventListener('click', () => {
      document.querySelector(this.container).classList.toggle('invisible');
    });
    document.querySelector(this.container).addEventListener('click', event => {
      if(event.target.classList.contains('del-btn')){
        this.removeProduct(event.target);
      }
    })
  }

}

class CartItem extends ProductItem{
  constructor(product, img = 'https://placehold.it/50x100'){
    super(product, img);
    this.quantity = product.quantity;
  }
  render(){
    return `<div class="cart-item" data-id="${this.id}">
            <div class="product-bio">
            <img src="${this.img}" alt="Some image">
            <div class="product-desc">
            <p class="product-title">${this.name}</p>
            <p class="product-quantity">Количество: ${this.quantity}</p>
        <p class="product-single-price">${this.price} за ед.</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">${this.quantity*this.price} ₽</p>
            <button class="del-btn" data-id="${this.id}">&times;</button>
        </div>
        </div>`
  }
}

const listContext = {
  ProductsList: ProductItem,
  Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);


////////////////////////////////////////////////////////  

// const products = [
//   {id: 1, title: 'Notebook', price: 20000},
//   {id: 2, title: 'Mouse', price: 1500},
//   {id: 3, title: 'Keyboard', price: 5000},
//   {id: 4, title: 'Gamepad', price: 4500},
// ];
//
// const renderProduct = ({ title, price }, img='https://placehold.it/200x150') => `<div class="product-item" data-id="${this.id}">
//               <img src="${img}" alt="Some img">
//               <div class="desc">
//                   <h3>${title}</h3>
//                   <p>${price} \u20bd</p>
//                   <button class="buy-btn">Купить</button>
//               </div>
//           </div>`;
//
// const renderProducts = list => {
// document.querySelector('.products').insertAdjacentHTML('beforeend', list.map(item => renderProduct(item)).join(''));
// };
//
// renderProducts(products);
