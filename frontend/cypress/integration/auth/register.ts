describe('Register Page', () => {
  it('Register page renders', () => {
    cy.visit('/register')

    cy.contains('Sign up for an account.')
  })
})
