const $amountToConvert = document.querySelector('#amount-to-convert');
const $currencyBase = document.querySelector('#currency-base');
const $currencyTarget = document.querySelector('#currency-target');

const $conversionResult = document.querySelector('#conversion-result');
const $conversionUpdate = document.querySelector('#conversion-update-time');
const $exchangeBase = document.querySelector('#exchange-base-select');
const $exchangeUpdate = document.querySelector('#exchange-update-time');

const $tableBody = document.querySelector('tbody');

document.querySelector('#convert-currency-btn').onclick = () => {
  const currencyBase = $currencyBase.value;
  const currencyTarget = $currencyTarget.value;
  const amountToConvert = $amountToConvert.value;

  // These messages will be shown while getting the data from the API.
  showLoadingMessage($conversionResult, 'Converting...');
  showLoadingMessage($conversionUpdate, 'getting date...');

  getConversionResult(currencyBase, currencyTarget, amountToConvert)
    .then((result) => {
      $conversionResult.textContent = `${amountToConvert} ${currencyBase} =
      ${result.conversion_result} ${currencyTarget}`;

      $conversionUpdate.textContent = simplifyUpdateTime(result.time_last_update_utc);
    })
    .catch((error) => {
      console.log(error);
    });
};

document.querySelector('#exchange-base-select').onchange = (e) => {
  const exchangeBase = e.target.value;
  $tableBody.textContent = '';

  getCurrencyExchange(exchangeBase)
    .then((exchange) => {
      Object.keys(exchange.conversion_rates).forEach((currencyCode) => {
        const $tableRow = document.createElement('tr');
        const $tableHeader = document.createElement('th');
        const $tableData = document.createElement('td');

        $tableHeader.scope = 'row';
        $tableHeader.textContent = currencyCode;
        $tableData.textContent = exchange.conversion_rates[currencyCode];

        $tableBody.appendChild($tableRow);
        $tableRow.append($tableHeader, $tableData);
      });

      $exchangeUpdate.textContent = simplifyUpdateTime(exchange.time_last_update_utc);
    })
    .catch((error) => {
      console.log(error);
    });
};

function getCurrencyExchange(base) {
  const url = getApiUrl(`latest/${base}`);
  return fetch(url).then((response) => response.json());
}

function getConversionResult(base, target, amount) {
  const url = getApiUrl(`pair/${base}/${target}/${amount}`);
  return fetch(url).then((response) => response.json());
}

function getApiUrl(endpoint) {
  return `https://v6.exchangerate-api.com/v6/KEY-HERE/${endpoint}`;
}

function createCurrencyOptions() {
  const url = getApiUrl('codes');
  fetch(url)
    .then((response) => response.json())
    .then((currencyData) => {
      currencyData.supported_codes.forEach((supportedCode) => {
        const $currencyOption = document.createElement('option');

        $currencyOption.value = supportedCode[0];
        $currencyOption.textContent = `${supportedCode[0]} - ${supportedCode[1]}`;

        $currencyBase.appendChild($currencyOption);
        $currencyTarget.appendChild($currencyOption.cloneNode(true));
        $exchangeBase.appendChild($currencyOption.cloneNode(true));
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function showLoadingMessage(element, message) {
  element.textContent = message;
}

// Removes the UTC time zone offset (+0000) from the string
// returned by the API (Mon, 02 Oct 2023 00:00:01 +0000) in
// order to make the "last update" message more user-friendly.
function simplifyUpdateTime(string) {
  return string.slice(0, string.indexOf('+'));
}
