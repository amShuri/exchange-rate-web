const URL = '127.0.0.1:8080';

beforeEach(() => {
  cy.visit(URL);
});

describe('Website loads correctly', () => {
  it('contains key DOM elements', () => {
    cy.get('main').should('exist');
    cy.get('header').should('exist');
    cy.get('section').should('exist');
    cy.get('footer').should('exist');
  });
});

describe('Data fetches correctly', () => {
  it('contains the currency codes', () => {
    cy.get('#currency-base')
      .find('option')
      .should('satisfy', (options) => options.length > 20);

    cy.get('#currency-target')
      .find('option')
      .should('satisfy', (options) => options.length > 20);

    cy.get('#exchange-rates')
      .find('option')
      .should('satisfy', (options) => options.length > 20);

    cy.get('#currency-base')
      .select(5)
      .invoke('val')
      .should('satisfy', (value) => value.match(/[A-Z]{3}/));
  });
});

describe('Performs currency conversions', () => {
  it('completes a currency conversion succesfully', () => {
    const resultPattern = /[0-9.][A-Z]{3}=[0-9.]+[A-Z]{3}/;
    const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;

    cy.get('#conversion-amount').type('10.50');
    cy.get('#currency-base').select(1);
    cy.get('#currency-target').select(2);
    cy.get('#convert-button').click();
    cy.get('#result').should(($result) => {
      // Cypress is returning the result with a line break and a lot of whitespace,
      // so before checking if the result matches the pattern, we remove all the whitespace
      // from it and match it against a regex pattern with no whitespace.
      let result = $result.text().replace(/\s+/g, '');
      expect(result).to.match(resultPattern);
    });

    cy.get('#update-time').then((time) => {
      const result = time.text();
      expect(result).to.match(datePattern);
    });
  });

  it('throws an error when providing invalid inputs', () => {
    cy.get('#conversion-amount').type('-1');
    cy.get('#convert-button').click();
    cy.get('#conversion-amount + span').should(
      'contain',
      'The amount must be a positive number.'
    );
    cy.get('#currency-base + span').should('contain', 'Select a currency to proceed.');
    cy.get('#currency-target + span').should('contain', 'Select a currency to proceed.');
  });

  it('throws an error when providing identical currencies', () => {
    cy.get('#currency-base').select(2);
    cy.get('#currency-target').select(2);
    cy.get('#convert-button').click();
    cy.get('#currency-base + span').should('contain', 'Currencies cannot be identical.');
    cy.get('#currency-target + span').should(
      'contain',
      'Currencies cannot be identical.'
    );
  });
});

describe('Table populates correctly', () => {
  it('shows exchange rates successfully', () => {
    cy.get('#exchange-rates').select(3);
    cy.get('tbody')
      .find('tr')
      .should('satisfy', (elements) => elements.length > 10);
  });
});
