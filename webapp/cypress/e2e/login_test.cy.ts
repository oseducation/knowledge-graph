describe('Login page', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('should display error message when email and password are invalid', () => {
        cy.get('input[name="email"]').type('cypresstest@gmail.com');
        cy.get('input[name="password"]').type('12345677');
        cy.get('button[type="submit"]').click();
        cy.contains('incorrect Username or Password').should('exist');
    });

    it('should redirect to welcome page when email and password are valid', () => {
        cy.intercept('POST', '/api/v1/users/login', (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    id: '123',
                    email: 'cypresstest@gmail.com',
                    password: '12345678',
                    role: 'user'
                },
            });
        });

        cy.get('input[name="email"]').type('cypresstest@gmail.com');
        cy.get('input[name="password"]').type('12345678');
        cy.get('button[type="submit"]').click();
        cy.url().should('contain', '/welcome');
    });

});
