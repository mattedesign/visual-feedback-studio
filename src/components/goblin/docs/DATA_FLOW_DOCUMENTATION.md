# Goblin Analysis Data Flow Documentation

## ⚠️ CRITICAL: AI Modification Guidelines

**This document outlines the data flow that MUST NOT be simplified or broken by AI modifications.**

### 🚨 AI Safety Rules

1. **NEVER** simplify the `safeExtractAnalysisContent()` function
2. **NEVER** remove validation checks from data extraction
3. **NEVER** change the return types of validation functions
4. **ALWAYS** maintain fallback content generation
5. **ALWAYS** preserve error handling and logging

---

## Data Flow Architecture

### 1. Image Upload → Analysis Pipeline

```
User Upload → Goblin Session → Edge Function → Claude Analysis → Results Storage
     ↓              ↓              ↓              ↓               ↓
  Files stored → Session ID → Image Processing → AI Analysis → Database Save
```

### 2. Analysis Results → Chat Interface

```
Database Results → useChatHistory → Chat Component → User Display
       ↓               ↓               ↓              ↓
   Persona Data → Validation → Safe Extraction → Message Creation
```

**CRITICAL POINTS:**
- Persona data structure can vary between analysis runs
- Must validate data before extraction
- Must provide fallback content if extraction fails
- Must track data transformations for debugging

### 3. Chat Interaction Flow

```
User Input → Edge Function → AI Response → Message Storage → UI Update
     ↓            ↓             ↓             ↓             ↓
  Validation → Processing → Content Gen → Database → Display
```

---

## Data Structures

### PersonaAnalysisData
```typescript
interface PersonaAnalysisData {
  analysis?: string;           // Primary content source
  synthesis_summary?: string;  // Fallback content
  goblinWisdom?: string;      // Alternative content
  persona_feedback?: Record<string, any>; // Nested content
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;                  // Required: Unique identifier
  role: 'user' | 'clarity';   // Required: Message source
  content: string;             // Required: Message text
  timestamp: Date;             // Required: Creation time
  // Optional metadata fields...
}
```

---

## Validation Requirements

### 1. Persona Data Validation
- Check for null/undefined data
- Validate expected field types
- Ensure at least one content source exists
- Log validation failures for debugging

### 2. Chat Message Validation
- Verify required fields are present
- Check field types match interface
- Ensure content is non-empty string
- Validate role is correct enum value

### 3. Session Data Validation
- Confirm session ID exists
- Check session status
- Validate persona type
- Track session lifecycle

---

## Error Handling Strategy

### 1. Graceful Degradation
- Always provide fallback content
- Never display raw error messages to users
- Log detailed errors for debugging
- Maintain user experience continuity

### 2. Monitoring & Alerting
- Track all data transformations
- Monitor success/failure rates
- Store error reports for analysis
- Alert on critical failure patterns

### 3. Recovery Mechanisms
- Retry failed operations when appropriate
- Provide manual refresh options
- Clear corrupted cache data
- Fallback to default behaviors

---

## Testing Requirements

### Integration Safeguards
- Validate data extraction works
- Test fallback content generation
- Verify error handling paths
- Check monitoring functionality

### Critical Test Cases
1. Empty persona data handling
2. Invalid data structure handling
3. Missing analysis content handling
4. API failure recovery
5. Message validation edge cases

---

## Debugging Tools

### Data Flow Monitor
- Tracks all data transformations
- Logs success/failure events
- Provides metrics dashboard
- Stores event history

### Error Boundary
- Catches React component errors
- Provides fallback UI
- Reports errors for analysis
- Enables error recovery

### Validation System
- Runtime data structure checks
- Type safety enforcement
- Detailed error reporting
- Preventive failure detection

---

## Maintenance Guidelines

### Code Changes
1. Run integration safeguards before deployment
2. Verify critical data flows still work
3. Test with various data structures
4. Monitor for increased error rates

### AI Assistance Rules
1. Always preserve validation functions
2. Never simplify error handling
3. Maintain fallback mechanisms
4. Keep monitoring instrumentation

### Regular Health Checks
1. Review error reports weekly
2. Analyze data flow metrics
3. Update validation rules as needed
4. Test critical paths monthly

---

## Contact & Support

If this data flow is broken:
1. Check the validation logs
2. Review error boundary reports
3. Run integration safeguards
4. Analyze data flow monitor events

**Remember: Prevention is better than fixing. Always validate before transforming data.**