describe('Login Page', () => {
  it('Login page renders', () => {
    cy.visit('/login')
    cy.contains('Sign In')
  })

  it('The test super admin can log in', () => {
    cy.fixture('super-admin-user').then((user) => {
      cy.visit('/')
      cy.get('#email')
        .type(user.email)
        .get('#password')
        .type(user.password)
        .get('[data-cy=submit]')
        .click()
    })

    cy.contains('My Case Dashboard')
  })
})
