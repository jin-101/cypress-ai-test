// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Cypress Testing Library를 사용하기 위해 import 합니다.
// 이 구문을 추가하면 cy.findByRole, cy.findByText 등의 명령어를 사용할 수 있습니다.
import "@testing-library/cypress/add-commands";

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
});
