# Frontend vs ssapi Backend - Gap Analysis

## Critical Issues Found

### 1. Hardcoded Backend URLs
**File:** `src/utils/invoiceApi.ts` line 37
- Auth URL hardcoded as string instead of using env var
- Blocks production deployment
- **Fix:** Use VITE_KSEF_AUTH_URL environment variable

### 2. No Session Validation Before Submission
**Files:** `src/pages/InvoicePage.tsx`
- No check if KSeF session valid before POSTing invoice
- Backend returns 401 but no recovery path
- **Fix:** Add validateSession() call before submission

### 3. Inadequate Invoice Status Polling
**File:** `src/pages/InvoicePage.tsx` lines 687-705
- Only attempts ONE GET for invoice details
- If KSeF still processing (100, 150), user sees "unavailable"
- No retry, backoff, or timeout
- **Fix:** Implement exponential backoff polling (30 retries, 1-10s delays)

### 4. Incomplete Error Handling
**File:** `src/pages/InvoicePage.tsx` lines 785-797
Missing handlers:
- 401: Session expired
- 403: Forbidden (cert invalid)
- 429: Rate limited
- 500+: Server errors
- Network timeouts
- **Fix:** Add specific error handlers for each case

### 5. Incorrect Status Mapping
**File:** `src/pages/InvoicesHistoryPage.tsx` lines 48-53
```typescript
if (invoice.ksef_number) return 'accepted'  // WRONG: assumes presence = accepted
if (invoice.status_code && invoice.status_code === 200) return 'sent'  // WRONG
```
- Should map: 100→sent, 150→sending, 200→accepted, 400+→error
- **Fix:** Use proper status code mapping function

### 6. Type Safety Gaps
**File:** `src/utils/invoiceApi.ts` lines 9-22
- Missing: QRCodeData, UPOData, InvoiceStatus interfaces
- Referenced in code but not typed
- **Fix:** Add complete type definitions

### 7. No Request Timeout
**File:** `src/pages/InvoicePage.tsx` line 658
- POST request can hang indefinitely
- **Fix:** Add AbortController with 30s timeout

### 8. Missing Request Validation
- No validation that total_gross_cents matches XML
- No shop name validation
- No NIP format check
- **Fix:** Add validateSubmissionRequest() function

### 9. Inconsistent ID Schemes
- Frontend uses UUID (inv_timestamp_random)
- Backend uses reference_number (YYYYMMDD-XX-...)
- localStorage and backend can diverge
- **Fix:** Use reference_number as primary key, backend as source of truth

### 10. Missing DELETE Endpoint
**File:** `src/pages/InvoicesHistoryPage.tsx` lines 40-44
- Placeholder with TODO comment
- **Fix:** Implement DELETE /invoices/{reference_id} endpoint

## Environment Configuration Needed

Add to `.env.local`:
```env
VITE_KSEF_API_URL=http://localhost:8000/invoices
VITE_KSEF_AUTH_URL=http://localhost:8000/ksef-authentications
VITE_KSEF_SESSION_URL=http://localhost:8000/session
VITE_INVOICE_SUBMIT_TIMEOUT=30000
VITE_INVOICE_POLL_TIMEOUT=120000
VITE_INVOICE_POLL_MAX_RETRIES=30
VITE_INVOICE_POLL_INITIAL_DELAY=1000
VITE_INVOICE_POLL_MAX_DELAY=10000
VITE_INVOICE_POLL_BACKOFF=1.5
```

## Priority Breakdown

### Priority 1 (Critical - 1-2 weeks)
- [ ] Remove hardcoded URLs
- [ ] Add session validation
- [ ] Implement polling with backoff
- [ ] Add comprehensive error handling
- [ ] Add request timeout
- [ ] Update .env configuration

### Priority 2 (High - 1-2 weeks)
- [ ] Add type definitions (QRCode, UPO, Status)
- [ ] Fix status mapping
- [ ] Add request validation
- [ ] Implement retry mechanism
- [ ] Backend as source of truth

### Priority 3 (Medium - 2-3 weeks)
- [ ] Delete endpoint implementation
- [ ] Resubmission workflow
- [ ] Amendment support
- [ ] Batch processing
- [ ] Test coverage

## Files Requiring Changes

| File | Priority | Changes |
|------|----------|---------|
| `src/utils/invoiceApi.ts` | P1 | Remove hardcoded URLs, add session validation, polling, types |
| `src/pages/InvoicePage.tsx` | P1 | Error handling, timeout, polling, validation |
| `.env.local` | P1 | Add all configuration variables |
| `src/pages/InvoicesHistoryPage.tsx` | P2 | Fix status mapping, implement delete |
| `src/utils/types.ts` | P2 | Add type definitions |
| `src/utils/invoiceStorage.ts` | P2 | Review status management |

## Risk Assessment

**If Priority 1 not fixed:**
- Production deployment blocked
- User experience issues
- Potential data loss on network errors

**If Priority 2 not fixed:**
- Edge case failures
- Reduced resilience
- Type safety issues

**If Priority 3 not fixed:**
- Missing convenience features
- Lower user experience

## Estimated Effort
- Critical fixes only: 1-2 weeks
- All recommended fixes: 4-5 weeks
- Including testing: 6-8 weeks

**Recommendation:** Fix Priority 1 before production release.
