/// <reference types="cypress" />

describe('Dashboard E2E', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('loads the dashboard', () => {
        cy.get('h1').should('contain', 'Dashboard');
    });

    it('connects wallet', () => {
        cy.get('button').contains('Connect Wallet').click();
        cy.get('div').should('contain', 'Connected');
    });

    it('shows price updates', () => {
        cy.get('[data-testid="price-feed"]').should('exist');
        cy.get('[data-testid="price-feed"]').should('contain', 'ETH');
    });
}); 