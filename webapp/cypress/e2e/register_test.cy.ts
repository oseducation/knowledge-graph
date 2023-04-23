describe('RegisterPage', () => {
    beforeEach(() => {
        cy.visit('localhost:9091/register');
    });

    it('successfully registers a new user', () => {
        cy.intercept('POST', '/api/v1/users/register', (req) => {
            req.reply({ statusCode: 201, body: {} });
        }).as('register');

        cy.get('input[name="first_name"]').type('John');
        cy.get('input[name="last_name"]').type('Doe');
        cy.get('input[name="username"]').type('newUser');
        cy.get('input[name="email"]').type('newUser@example.com');
        cy.get('input[name="password"]').type('password');
        cy.get('button[type="submit"]').click();

        cy.wait('@register').then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
        });

        cy.contains('Login').should('be.visible');

        cy.url().should('eq', 'http://localhost:9091/login');
    });
});
