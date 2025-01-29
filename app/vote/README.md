# Logo Gallery Voting System

## Overview
The Logo Gallery voting system allows users to vote for their favorite logos with specific rules and behaviors to ensure fair voting.

## Voting Rules

### Basic Rules
1. Each user can have only one active vote at a time
2. Users cannot vote for their own logos
3. Users can change their vote to a different logo at any time before the voting deadline
4. Only admin users can modify voting deadlines

### Voting Deadlines
- Each logo has a voting deadline (default: 30 days from creation)
- Votes cannot be cast or changed after the deadline
- Admin users can extend or shorten the voting period
- Deadlines must be set to a future date

### Use Cases

#### First-time Voting
- User visits the voting page
- User selects a logo they like (if within voting period)
- User clicks "Submit Vote"
- Vote is recorded and user is redirected to gallery
- The selected logo's vote count increases by 1

#### Changing Vote
- User returns to voting page
- Their current vote is indicated with "Currently voted"
- User selects a different logo (if within voting period)
- User clicks "Submit Vote"
- Previous vote is removed (vote count decreases by 1)
- New vote is recorded (new logo's vote count increases by 1)
- User is redirected to gallery

#### Admin: Modifying Voting Deadline
- Admin accesses logo management interface
- Selects a logo to modify
- Updates the voting deadline
- System validates the new deadline is in the future
- Deadline is updated and users are notified

#### Invalid Voting Attempts
1. **Voting for Own Logo**
   - System prevents voting
   - Error message: "Cannot vote for your own logo"

2. **Voting for Same Logo Again**
   - System prevents duplicate voting
   - Error message: "You have already voted for this logo"

3. **Voting After Deadline**
   - System prevents voting
   - Error message: "Voting period has ended for this logo"

4. **Voting Without Selection**
   - Submit button is disabled
   - Error message: "Please select a logo to vote"

### Technical Implementation
- Votes are stored in the database with:
  - User ID
  - Logo ID
  - Timestamp
- Each logo includes:
  - Voting deadline
  - Vote history
  - Total vote count
- Vote counts are maintained accurately through atomic operations
- Previous votes are automatically removed when changing votes
- Real-time UI updates reflect vote count changes

### Security Measures
- Authentication required for voting
- Admin authentication required for deadline modifications
- Server-side validation of all voting rules
- Prevention of duplicate votes
- Protection against voting for own logos
- Validation of voting deadlines 