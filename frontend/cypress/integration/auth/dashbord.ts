describe('Dashboard Home Page', () => {
  it('redirects to login by default', () => {
    cy.visit('/')

    cy.url().should('include', '/login')
  })
})
