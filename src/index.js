const $apiUpdateTime = document.querySelector('#update-time');

document.addEventListener('DOMContentLoaded', populateSelectElements);

document.querySelector('#convert-button').addEventListener('click', () => {
  const currencyBase = getValue('#currency-base');
  const currencyTarget = getValue('#currency-target');
  const conversionAmount = getValue('#conversion-amount');
  const $result = document.querySelector('#result');

  // Need validations for this functionality to work properly
  hideElement('#convert-button');
  showElement('#loading-button');

  getCurrencyConversion(conversionAmount, currencyBase, currencyTarget)
    .then((conversion) => {
      $result.textContent = `${conversionAmount} ${currencyBase} = 
      ${conversion.rates[currencyTarget]} ${currencyTarget}`;

      $apiUpdateTime.textContent = conversion.date;
      hideElement('#loading-button');
      showElement('#convert-button');
    })
    .catch((error) => {
      console.log(error);
    });
});

document.querySelector('#exchange-rates').addEventListener('change', (e) => {
  const $tableBody = document.querySelector('tbody');
  const exchangeBase = e.target.value;

  $tableBody.textContent = '';
  showElement('#loading-indicator');

  getCurrencyExchange(exchangeBase)
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

function getCurrencyExchange(currencyBase) {
  const URL = getApiUrl(`/latest?from=${currencyBase}`);
  return fetch(URL).then((response) => response.json());
}

function getCurrencyConversion(conversionAmount, currencyBase, currencyTarget) {
  const URL = getApiUrl(
    `/latest?amount=${conversionAmount}&from=${currencyBase}&to=${currencyTarget}`
  );
  return fetch(URL).then((response) => response.json());
}

function getApiUrl(endpoint) {
  return 'https://api.frankfurter.app' + endpoint;
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

function populateSelectElements() {
  const URL = getApiUrl('/currencies');
  const chachedExchangeRates = sessionStorage.getItem('exchangeRates');

  if (chachedExchangeRates) {
    const exchangeRates = JSON.parse(chachedExchangeRates);
    createSelectOptions(exchangeRates);
  } else {
    fetch(URL)
      .then((response) => response.json())
      .then((exchangeRates) => {
        sessionStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        createSelectOptions(exchangeRates);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function createSelectOptions(exchangeRates) {
  document.querySelectorAll('select').forEach((select) => {
    Object.keys(exchangeRates).forEach((key) => {
      select.insertAdjacentHTML(
        'beforeend',
        `<option value="${key}">${key} - ${exchangeRates[key]}</option>`
      );
    });
  });
}
