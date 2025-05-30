# Coding Standards

## 1. Directory Structure

```
backend/
├── src/
│   ├── config/         # Application configuration
│   ├── controllers/    # Business logic handlers
│   ├── middlewares/    # Middleware functions
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validations/    # Validation schemas
```

## 2. Naming Conventions

- **Files**: Use kebab-case (e.g., `auth-service.js`)
- **Classes**: Use PascalCase (e.g., `AuthService`)
- **Functions/Methods**: Use camelCase (e.g., `getUserProfile`)
- **Variables**: Use camelCase (e.g., `userData`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces**: Prefix with 'I' (e.g., `IUserData`)
- **Types**: Use PascalCase (e.g., `UserRole`)
- **Enums**: Use PascalCase (e.g., `UserStatus`)

## 3. Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use semicolons at the end of statements
- Use single quotes for strings
- Use template literals for string interpolation
- Use arrow functions for callbacks
- Use async/await instead of promises chains
- Use object destructuring for function parameters
- Use spread operator for object/array operations

## 4. Comment and Documentation

```javascript
/**
 * @fileoverview File overview description
 * @author Author Name
 * @created Creation Date
 * @file filename.js
 * @description Detailed description of functionality
 */

/**
 * @route HTTP_METHOD /api/endpoint
 * @description Route functionality description
 * @access Public/Private
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error description
 */
```

## 5. Error Handling

- Use try-catch for async operations
- Log errors with full stack trace
- Use custom error classes
- Return standardized error responses:

```javascript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string,
  code?: string
}
```

## 6. API Response Format

```javascript
// Success Response
{
  success: true,
  message: "Operation successful",
  data: {
    // Response data
  },
  meta?: {
    page?: number,
    limit?: number,
    total?: number
  }
}

// Error Response
{
  success: false,
  message: "Error message",
  error: "Detailed error in development",
  code: "ERROR_CODE"
}
```

## 7. Security Rules

- Never store passwords in plain text
- Use JWT for authentication
- Validate all user inputs
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Use HTTPS only
- Implement CORS properly
- Sanitize user inputs
- Use parameterized queries
- Implement proper session management

## 8. Testing

- Write unit tests for services
- Write integration tests for API endpoints
- Maintain test coverage > 80%
- Use test-driven development (TDD)
- Mock external dependencies
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

## 9. Git Commit Rules

- Format: `type(scope): message`
- Types:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - style: Code style
  - refactor: Code refactoring
  - test: Testing
  - chore: Maintenance
- Example: `feat(auth): add email verification`

## 10. Code Review Checklist

- [ ] Code follows style guide
- [ ] Documentation is complete
- [ ] Tests are written and passing
- [ ] No security vulnerabilities
- [ ] Performance is optimized
- [ ] Error handling is implemented
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] No hardcoded values
- [ ] Proper logging is implemented
- [ ] No console.log statements in production code

## 11. Performance Guidelines

- Use proper indexing in database
- Implement caching where appropriate
- Optimize database queries
- Use pagination for large datasets
- Implement lazy loading
- Minimize API calls
- Use compression
- Optimize images and assets
- Implement proper error boundaries

## 12. Accessibility Standards

- Use semantic HTML
- Implement proper ARIA labels
- Ensure keyboard navigation
- Maintain proper color contrast
- Provide text alternatives for images
- Make forms accessible
- Test with screen readers

## 13. Internationalization

- Use i18n for text content
- Support multiple languages
- Handle different date formats
- Handle different number formats
- Support RTL languages
- Use proper character encoding

## 14. Code Organization

- Follow Single Responsibility Principle
- Use dependency injection
- Implement proper separation of concerns
- Use design patterns appropriately
- Keep functions small and focused
- Use proper module structure
- Implement proper error boundaries
