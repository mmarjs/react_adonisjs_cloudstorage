describe('Reset Page', () => {
  it('Reset page renders', () => {
    cy.visit('/reset')

    cy.contains('Request a password reset email.')
  })
})
