const $apiUpdateTime = document.querySelector('#update-time');
const apiUrl = 'https://api.frankfurter.app';

document.addEventListener('DOMContentLoaded', populateSelectElements);

document.querySelector('#convert-button').addEventListener('click', () => {
  const currencyBase = getValue('#currency-base');
  const currencyTarget = getValue('#currency-target');
  const conversionAmount = getValue('#conversion-amount');
  const $result = document.querySelector('#result');

  // Need validations for this functionality to work properly
  hideElement('#convert-button');
  showElement('#loading-button');

  getExchangeRates(currencyBase)
    .then((exchange) => {
      const targetRate = exchange.rates[currencyTarget];
      const conversionResult = performConversion(conversionAmount, targetRate);

      $result.textContent = `${conversionAmount} ${currencyBase} = 
      ${conversionResult} ${currencyTarget}`;

      $apiUpdateTime.textContent = exchange.date;
      hideElement('#loading-button');
      showElement('#convert-button');
    })
    .catch((error) => {
      console.log(error);
    });
});

document.querySelector('#exchange-rates').addEventListener('change', () => {
  const currencyBase = getValue('#exchange-rates');
  const $tableBody = document.querySelector('tbody');

  $tableBody.textContent = '';
  showElement('#loading-indicator');

  getExchangeRates(currencyBase)
    .then((exchange) => {
      Object.keys(exchange.rates).forEach((key) => {
        $tableBody.insertAdjacentHTML(
          'beforeend',
          `<tr>
            <th scope="row">${key}</th>
            <td>${exchange.rates[key]}</td>
           </tr>`
        );

        $apiUpdateTime.textContent = exchange.date;
        hideElement('#loading-indicator');
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

function getExchangeRates(currencyBase) {
  //prettier-ignore
  return fetch(apiUrl + `/latest?from=${currencyBase}`)
    .then((response) => response.json());
}

function getValue($element) {
  return document.querySelector($element).value;
}

function showElement($element) {
  const $elementToShow = document.querySelector($element);
  $elementToShow.classList.remove('visually-hidden');
}

function hideElement($element) {
  const $elementToHide = document.querySelector($element);
  $elementToHide.classList.add('visually-hidden');
}

function performConversion(amount, targetRate) {
  return amount * targetRate;
}

function populateSelectElements() {
  const cachedData = sessionStorage.getItem('currencies');

  if (cachedData) {
    const currencies = JSON.parse(cachedData);
    createSelectOptions(currencies);
  } else {
    fetch(apiUrl + '/currencies')
      .then((response) => response.json())
      .then((currencies) => {
        sessionStorage.setItem('currencies', JSON.stringify(currencies));
        createSelectOptions(currencies);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function createSelectOptions(currencyNames) {
  document.querySelectorAll('select').forEach((select) => {
    Object.keys(currencyNames).forEach((key) => {
      select.insertAdjacentHTML(
        'beforeend',
        `<option value="${key}">${key} - ${currencyNames[key]}</option>`
      );
    });
  });
}
