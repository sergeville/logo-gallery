cmd

```hash 
pkill -f "next dev" 2>/dev/null; pkill -f "playwright show-report" 2>/dev/null; sleep 5 && NODE_ENV=test npm run test:visual:update
``` 

I noticed earlier that there were empty <custom_instructions> tags with just a question mark in them. Let me suggest some helpful custom instructions that could improve our interaction:
explanations
These instructions would help ensure that my responses are:
Easy to follow with clear steps
Backed by concrete examples
Technically thorough
Following best practices
Considering multiple solutions
Focused on long-term code quality
Would you like me to follow these instructions in our conversation? Or would you prefer different guidelines for how I should structure my responses?

```hash 
npx playwright test --config=playwright.visual.config.ts

pkill -f "playwright|node"
```

Would you like me to:
- Add more specific component tests?
- Set up Percy.io integration?
- Add more documentation?
- Configure CI/CD for visual testing?

```npm run
npm run test:visual          # Run tests
npm run test:visual:update   # Update snapshots
npm run test:visual:ui       # Debug with UI
```