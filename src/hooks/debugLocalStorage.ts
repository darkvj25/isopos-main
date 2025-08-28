const logLocalStorage = () => {
  const products = localStorage.getItem('pos_products');
  console.log('Products in Local Storage:', products);
};

logLocalStorage();
