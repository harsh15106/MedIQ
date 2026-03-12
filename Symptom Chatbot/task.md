## Phase 5: Supabase-Driven Diagnostic Integration

### Database
- [ ] Create `symptoms` and `disease_symptom_map` tables in Supabase
- [ ] Seed `symptoms` with 100+ entries (region + severity)
- [ ] Seed `disease_symptom_map` with weighted disease-symptom links

### Backend Python Engine
- [ ] Create `supabase_client.py` with query helpers
- [ ] Update `api.py` to use Supabase as primary disease source
- [ ] Update `question_selector.py` to pull DB-sourced symptoms
- [ ] Update `bayesian_engine.py` with weighted DB scoring
- [ ] Update `clinical_response_engine.py` to use DB disease descriptions

### Verification
- [ ] Test "calf pain" → only lower limb diseases
- [ ] Test "stomach pain" → only abdomen diseases
- [ ] Verify systemic diseases blocked without 2+ systemic indicators
