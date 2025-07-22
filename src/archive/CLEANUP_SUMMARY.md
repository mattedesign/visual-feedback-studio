
# Codebase Cleanup Summary

## Date: January 21, 2025

### Archived Components

#### Goblin Components
- `src/components/goblin/chat/components/ChatMessageWithScreenRefs.tsx` → `src/archive/goblin/chat/components/ChatMessageWithScreenRefs.tsx`
- `src/components/goblin/chat/components/LoadingIndicator.tsx` → `src/archive/goblin/chat/components/LoadingIndicator.tsx`
- `src/components/goblin/chat/components/ChatInput.tsx` → `src/archive/goblin/chat/components/ChatInput.tsx`

#### Analysis Components
- `src/components/analysis/AnalysisStudio.tsx` → `src/archive/analysis/AnalysisStudio.tsx`

### Active Components Remaining
- `src/pages/goblin/GoblinStudio.tsx` - Main goblin analysis interface
- `src/pages/goblin/GoblinStudioPage.tsx` - Studio page with chat interface  
- `src/pages/goblin/GoblinResults.tsx` - Results display page
- `src/hooks/goblin/useStudioSession.ts` - Session management hook
- `src/hooks/goblin/useImageLoader.ts` - Image loading utilities
- `src/services/goblin/index.ts` - Core goblin services
- `src/services/goblin/maturityScoreService.ts` - Maturity scoring logic

### Edge Functions (Active)
- `supabase/functions/goblin-chat-analyzer/index.ts` - Chat analysis
- `supabase/functions/goblin-chat-analyzer-v2/index.ts` - Optimized chat analysis
- `supabase/functions/goblin-backfill-maturity-scores/index.ts` - Score backfill
- `supabase/functions/goblin-maturity-monitor/index.ts` - Health monitoring

### Routes Updated
- Added proper goblin routes to `src/App.tsx`
- Removed references to archived components
- Maintained all functional routes

### Database Tables (Unchanged)
All goblin-related database tables remain active:
- `goblin_analysis_sessions`
- `goblin_analysis_results`
- `goblin_analysis_images`
- `goblin_maturity_scores`
- `goblin_achievements`
- `goblin_refinement_history`
- `goblin_roadmap_items`
- `goblin_industry_benchmarks`

### Notes
- All archived components are preserved for reference
- No breaking changes to active functionality
- Database structure remains intact
- Edge functions continue to operate normally
