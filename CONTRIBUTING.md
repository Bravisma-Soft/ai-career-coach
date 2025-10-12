# Contributing to AI Career Coach

Thank you for considering contributing to AI Career Coach! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/ai-career-coach.git
   cd ai-career-coach
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new files
- **Naming**: Use camelCase for variables/functions, PascalCase for components
- **Components**: One component per file
- **Imports**: Group imports (React, libraries, local)

### Component Guidelines

```typescript
// Good component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit({});
      toast({ title: 'Success!' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleSubmit} disabled={isLoading}>
        Submit
      </Button>
    </div>
  );
}
```

### Design System

- **Colors**: Use semantic tokens from `index.css`, never hard-code colors
- **Spacing**: Use Tailwind spacing utilities
- **Typography**: Follow the established type scale
- **Animations**: Use predefined animations from `index.css`

### State Management

- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Zustand stores
- **Server State**: Use React Query hooks

### API Integration

- **Services**: Put API calls in service files (`src/services/`)
- **Types**: Define response types
- **Error Handling**: Always handle errors with try-catch
- **Loading States**: Show loading indicators

## 🧪 Testing

### Running Tests

```bash
npm run test
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" onSubmit={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(jobs): add job filtering by company name
fix(resume): correct PDF upload validation
docs(readme): update installation instructions
```

## 🔄 Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Test Your Changes**: Ensure all tests pass
3. **Check Build**: Run `npm run build` successfully
4. **Create PR**: 
   - Use a clear title
   - Describe what changes were made
   - Reference any related issues
   - Add screenshots for UI changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] Tests pass locally
```

## 🐛 Reporting Bugs

### Before Submitting

- Check existing issues
- Try to reproduce with latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives**
What alternatives have you considered?

**Additional Context**
Any other relevant information
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

## 🎯 Priority Areas

We're particularly interested in contributions in these areas:

- Accessibility improvements
- Performance optimizations
- Test coverage
- Documentation enhancements
- Mobile responsiveness
- Internationalization (i18n)

## ❓ Questions?

Feel free to:
- Open an issue with your question
- Join our community discussions
- Reach out to maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
