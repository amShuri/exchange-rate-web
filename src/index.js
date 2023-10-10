const $apiUpdateTime = document.querySelector('#update-time');
const apiUrl = 'https://api.frankfurter.app';

document.addEventListener('DOMContentLoaded', populateSelectElements);

document.querySelector('#convert-button').addEventListener('click', () => {
  const currencyBase = getValue('#currency-base');
  const currencyTarget = getValue('#currency-target');
  const conversionAmount = getValue('#conversion-amount');
  const $result = document.querySelector('#result');
  let conversionResult = 0;

  const hasErrors = validateField(currencyBase, currencyTarget, conversionAmount);
  if (hasErrors) return;

  hideElement('#convert-button');
  showElement('#loading-button');

  getExchangeRates(currencyBase)
    .then((exchange) => {
      const targetRate = exchange.rates[currencyTarget];

      // The `exchange` object doesn't have the base currency property,
      // so the `performConversion` function throws an error when
      // performing a conversion for identical currencies.
      if (currencyBase == currencyTarget) {
        conversionResult = conversionAmount;
      } else {
        conversionResult = performConversion(conversionAmount, targetRate);
      }

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
  fetch(apiUrl + '/currencies')
    .then((response) => response.json())
    .then((currencies) => {
      document.querySelectorAll('select').forEach((select) => {
        Object.keys(currencies).forEach((key) => {
          select.insertAdjacentHTML(
            'beforeend',
            `<option value="${key}">${key} - ${currencies[key]}</option>`
          );
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function validateField(base, target, amount) {
  const errors = {
    'currency-base': validateCurrency(base),
    'currency-target': validateCurrency(target),
    'conversion-amount': validateAmount(amount),
  };

  return handleErrors(errors);
}

function handleErrors(errors) {
  let hasErrors = false;

  Object.keys(errors).forEach((key) => {
    const validationError = errors[key];
    const $inputElement = document.querySelector(`#${key}`);
    const $errorElement = document.querySelector(`#${key} + span`);

    if (validationError) {
      hasErrors = true;
      $errorElement.textContent = validationError;
      $inputElement.classList.add('border', 'border-danger');
    } else {
      $errorElement.textContent = '';
      $inputElement.classList.remove('border', 'border-danger');
    }
  });

  return hasErrors;
}
