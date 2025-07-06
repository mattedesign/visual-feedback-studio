# Archived Analysis Services

This directory contains the original analysis system services that were archived during the transition to Figmant v128.1 Goblin Edition.

**Archive Date:** January 2025
**Reason:** Preparing namespace for new goblin-based analysis system

## What's Archived Here
- All original analysis service functions
- AI integration services
- Pipeline services
- RAG and knowledge services

## Status
- ❌ **ARCHIVED** - These services are preserved but not actively used
- ✅ **REFERENCE ONLY** - Available for reference during goblin development
- 🔄 **REPLACEABLE** - New goblin system uses `src/services/goblin/` namespace

## Migration Notes
- New goblin services use `goblin_` database table prefixes
- Edge functions will use `goblin-` prefix instead of `analysis-`