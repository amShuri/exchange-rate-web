function validateAmount(amount) {
  if (amount == '') {
    return 'The amount cannot be empty.';
  }

  if (amount <= 0) {
    return 'The amount must be at least 1.';
  }

  if (amount.length > 15) {
    return 'The amount cannot exceed 15 digits.';
  }

  if (!amount.match(/[0-9]/g)) {
    return 'Only numeric characters (0-9) are allowed.';
  }
}

function validateCurrency(currency) {
  if (currency == '') {
    return 'Select a currency to proceed.';
  }
}
