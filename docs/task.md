# Techzen Culture Fit Implementation Task List

- [/] Update Typing and Data Structure
  - [ ] Add `TechzenCultureFit` interface to the scoring models.
  - [ ] Modify `UnifiedScoringResult` to include culture fit scores.
- [ ] Implement Calculation Logic
  - [ ] Add algorithm in `unifiedScoring.ts` to calculate 5 pillar scores based on dimension mappings.
- [ ] Integrate with AI Analysis Engine
  - [ ] Update `aiAnalysis.ts` prompt to include the 5 culture pillars and the user's specific text generation rules.
  - [ ] Update the JSON schema in `aiAnalysis.ts` to capture the AI's culture evaluation paragraph.
  - [ ] Ensure AI cache/generation supports the new fields without breaking.
- [ ] Build UI Components
  - [ ] Create UI for Techzen Culture Fit combining the Progress Bars and the AI narrative.
  - [ ] Integrate into `UnifiedReport.tsx`.
- [ ] Testing and Validation
  - [ ] Verify calculation outputs.
  - [ ] Generate sample report visually using `browser_subagent`.
