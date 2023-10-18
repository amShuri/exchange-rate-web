const $apiUpdateTime = document.querySelector('#update-time');
const apiUrl = 'https://api.frankfurter.app';

document.addEventListener('DOMContentLoaded', createCurrencyOptions);

document.querySelector('#exchange-rates').addEventListener('change', updateExchangeTable);

document.querySelector('#convert-button').addEventListener('click', () => {
  const currencyBase = getValue('#currency-base');
  const currencyTarget = getValue('#currency-target');
  const conversionAmount = getValue('#conversion-amount');

  const hasErrors = validateInputValue(currencyBase, currencyTarget, conversionAmount);
  if (hasErrors) return;

  hideElement('#convert-button');
  showElement('#loading-button');

  getConversionResult(currencyBase, currencyTarget, conversionAmount)
    .then((data) => {
      showConversionResult(data, currencyBase, currencyTarget, conversionAmount);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      hideElement('#loading-button');
      showElement('#convert-button');
    });
});

function getConversionResult(currencyBase, currencyTarget, conversionAmount) {
  return getExchangeRates(currencyBase).then((data) => {
    const targetRate = data.rates[currencyTarget];
    const result = conversionAmount * targetRate;
    return {
      result: Number(result.toFixed(2)),
      update: data.date,
    };
  });
}

function showConversionResult(data, currencyBase, currencyTarget, conversionAmount) {
  // prettier-ignore
  updateTextContent('#result', `${conversionAmount} ${currencyBase} = ${data.result} ${currencyTarget}`);
  updateTextContent('#update-time', data.update);
}

function updateExchangeTable() {
  const currencyBase = getValue('#exchange-rates');

  updateTextContent('tbody', '');
  showElement('#loading-indicator');

  getExchangeRates(currencyBase)
    .then((data) => {
      Object.keys(data.rates).forEach((key) => {
        document.querySelector('tbody').insertAdjacentHTML(
          'beforeend',
          `<tr>
            <th scope="row">${key}</th>
            <td>${data.rates[key]}</td>
           </tr>`
        );
      });
      updateTextContent('#update-time', data.date);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      hideElement('#loading-indicator');
    });
}

function createCurrencyOptions() {
  getCurrencies()
    .then((data) => {
      document.querySelectorAll('select').forEach((select) => {
        Object.keys(data).forEach((key) => {
          select.insertAdjacentHTML(
            'beforeend',
            `<option value="${key}">${key} - ${data[key]}</option>`
          );
        });
      });
    })
    .catch((err) => console.log(err));
}

function getExchangeRates(currencyBase) {
  return fetch(apiUrl + `/latest?from=${currencyBase}`).then((response) =>
    response.json()
  );
}

function getCurrencies() {
  return fetch(apiUrl + '/currencies').then((response) => response.json());
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

function updateTextContent($element, text) {
  const $elementToUpdate = document.querySelector($element);
  $elementToUpdate.textContent = text;
}

function validateInputValue(base, target, amount) {
  const errors = {
    'currency-base': validateCurrency(base) || validateIdentical(base, target),
    'currency-target': validateCurrency(target) || validateIdentical(base, target),
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
