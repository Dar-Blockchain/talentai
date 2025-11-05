# Preferences Components

This folder contains the modularized components for the preferences setup system in TalentAI.

## Component Structure

### Core Components

- **`PreferencesMain.tsx`** - Main orchestrator component that manages the entire preferences flow
- **`PreferencesHeader.tsx`** - Navigation header with logo, user info, and logout button
- **`PreferencesStepper.tsx`** - Step indicator component (existing)

### Step Components

- **`UserTypeSelection.tsx`** - User type selection (Candidate vs Company)
- **`PersonalDetails.tsx`** - Personal information input for candidates
- **`CompanyDetails.tsx`** - Company information input for companies
- **`SkillsSelection.tsx`** - Skills selection with categories and Hedera experience
- **`ExperienceLevel.tsx`** - Experience level selection for companies
- **`ProficiencyRating.tsx`** - Skill proficiency rating for candidates
- **`HederaQCM.tsx`** - Hedera experience verification questions
- **`Review.tsx`** - Final review step before submission

### Hooks

- **`usePreferences.ts`** - Custom hook managing all preferences state and logic

## Usage

### Basic Implementation

```tsx
import { PreferencesMain, PreferencesHeader } from '@/components/preferences';

const PreferencesPage = () => {
  const handleLogout = () => {
    // Logout logic
  };

  return (
    <Box>
      <PreferencesHeader
        userType="candidate"
        username="John Doe"
        email="john@example.com"
        onLogout={handleLogout}
      />
      <PreferencesMain />
    </Box>
  );
};
```

### Using Individual Components

```tsx
import { UserTypeSelection, SkillsSelection } from '@/components/preferences';

const CustomFlow = () => {
  const [userType, setUserType] = useState('');
  
  return (
    <Box>
      <UserTypeSelection
        userType={userType}
        onUserTypeSelect={setUserType}
        isTestJobReturnUrl={false}
      />
      {userType === 'candidate' && (
        <SkillsSelection
          userType={userType}
          selectedCategory="development"
          setSelectedCategory={setSelectedCategory}
          skills={skills}
          setSkills={setSkills}
          requiredSkills={[]}
          setRequiredSkills={() => {}}
          hederaExp=""
          setHederaExp={() => {}}
          skillWarning=""
          GREEN_MAIN="#8310FF"
        />
      )}
    </Box>
  );
};
```

### Using the Custom Hook

```tsx
import { usePreferences } from '@/components/preferences';

const CustomComponent = () => {
  const {
    userType,
    skills,
    setSkills,
    handleNext,
    isCurrentStepValid
  } = usePreferences();

  return (
    <Button 
      onClick={handleNext}
      disabled={!isCurrentStepValid()}
    >
      Next
    </Button>
  );
};
```

## Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to debug and update individual parts
4. **Testing**: Each component can be tested in isolation
5. **Performance**: Smaller components lead to better React optimization
6. **Code Organization**: Clear separation of concerns

## State Management

The `usePreferences` hook centralizes all state management, making it easy to:
- Share state between components
- Implement undo/redo functionality
- Save progress to localStorage
- Handle form validation
- Manage navigation between steps

## Styling

All components use Material-UI with consistent theming:
- Primary colors: `GREEN_MAIN` (company) or `#8310FF` (candidate)
- Consistent spacing and typography
- Responsive design for mobile and desktop
- Smooth animations and transitions

## Future Enhancements

- Add TypeScript interfaces for all props
- Implement form validation schemas
- Add unit tests for each component
- Create storybook stories for development
- Add accessibility improvements
- Implement internationalization support
