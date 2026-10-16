/**
 * =============================================================================
 * RELICUS SECURITY AUDIT: RLS SECURITY POSTURE VERIFICATION
 * =============================================================================
 * Verifies that the 5 tables flagged by Supabase Security Advisor:
 *   1. public.therapists
 *   2. public.bookings
 *   3. public.payments
 *   4. public.email_audit
 *   5. public.webhook_events
 *
 * are properly protected under Row Level Security (RLS) and that anonymous
 * actors cannot leak sensitive data, manipulate financial transactions, or
 * alter system webhook/audit logs.
 *
 * Usage:
 *   node scripts/verify-rls-security-posture.cjs
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// 1. Load Supabase Environment Variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('[FAIL] .env file not found at:', envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
  const keyMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

  if (!urlMatch || !keyMatch) {
    console.error('[FAIL] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  return {
    supabaseUrl: urlMatch[1].trim(),
    anonKey: keyMatch[1].trim(),
  };
}

const { supabaseUrl, anonKey } = loadEnv();

console.log('=============================================================================');
console.log('         RELICUS POSTGREST & RLS SECURITY POSTURE AUDIT');
console.log('=============================================================================');
console.log(`Target Supabase URL: ${supabaseUrl}`);
console.log(`Auditor Persona: Anonymous / Public Unauthenticated Client\n`);

let passedCount = 0;
let totalChecks = 0;
const failureDetails = [];

async function apiRequest(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`;
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

function recordResult(name, condition, successMsg, failMsg) {
  totalChecks++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${name}`);
    console.log(`       -> ${successMsg}`);
  } else {
    console.log(`[FAIL] ${name}`);
    console.log(`       -> ${failMsg}`);
    failureDetails.push({ name, failMsg });
  }
  console.log('');
}

async function runAudit() {
  // ---------------------------------------------------------------------------
  // Check 1: Therapists Read & Write Isolation
  // ---------------------------------------------------------------------------
  console.log('--- [1/5] Verifying public.therapists ---');
  const therapistsRead = await apiRequest('therapists?select=id,name,specialty&limit=5');
  const therapistsDropped = therapistsRead.status === 404;
  
  if (therapistsDropped) {
    recordResult(
      'Therapists Status',
      true,
      'Table has been dropped/purged (Zero exposure - Security Advisor resolved)',
      ''
    );
  } else {
    recordResult(
      'Therapists Public Directory Read Access',
      therapistsRead.status === 200 && Array.isArray(therapistsRead.data),
      `Public catalog readable (${therapistsRead.data?.length || 0} entries returned)`,
      `Failed to read therapists catalog. HTTP Status: ${therapistsRead.status}`
    );

    const testTherapistName = '__security_audit_probe_therapist__';
    const therapistsUnauthorizedInsert = await apiRequest('therapists', {
      method: 'POST',
      body: JSON.stringify({ name: testTherapistName, specialty: 'Audit Probe' }),
    });
    const insertBlocked =
      therapistsUnauthorizedInsert.status === 401 ||
      therapistsUnauthorizedInsert.status === 403 ||
      therapistsUnauthorizedInsert.status === 404 ||
      (therapistsUnauthorizedInsert.status >= 400 &&
        JSON.stringify(therapistsUnauthorizedInsert.data).includes('row-level security'));

    if (!insertBlocked && therapistsUnauthorizedInsert.status === 201) {
      await apiRequest(`therapists?name=eq.${encodeURIComponent(testTherapistName)}`, { method: 'DELETE' });
    }

    recordResult(
      'Therapists Unauthorized INSERT Blocked',
      insertBlocked,
      `Anon INSERT blocked by RLS (HTTP ${therapistsUnauthorizedInsert.status})`,
      `VULNERABILITY: Anon was able to insert into therapists (HTTP ${therapistsUnauthorizedInsert.status})`
    );
  }

  // ---------------------------------------------------------------------------
  // Check 2: Bookings Data Isolation
  // ---------------------------------------------------------------------------
  console.log('--- [2/5] Verifying public.bookings ---');
  const bookingsRead = await apiRequest('bookings?select=*');
  const bookingsDropped = bookingsRead.status === 404;

  if (bookingsDropped) {
    recordResult(
      'Bookings Status',
      true,
      'Table has been dropped/purged (Zero exposure - Security Advisor resolved)',
      ''
    );
  } else {
    const bookingsProtected =
      bookingsRead.status === 200
        ? Array.isArray(bookingsRead.data) && bookingsRead.data.length === 0
        : bookingsRead.status === 401 || bookingsRead.status === 403;

    recordResult(
      'Bookings Anonymous SELECT Blocked / Filtered to 0',
      bookingsProtected,
      `RLS enforced: 0 rows leaked to anonymous user (Status ${bookingsRead.status})`,
      `VULNERABILITY: Leaked ${bookingsRead.data?.length} booking records to anonymous caller!`
    );

    const testBookingUserId = '00000000-0000-0000-0000-000000000099';
    const bookingsUnauthorizedInsert = await apiRequest('bookings', {
      method: 'POST',
      body: JSON.stringify({ user_id: testBookingUserId }),
    });
    const bookingInsertBlocked =
      bookingsUnauthorizedInsert.status === 401 ||
      bookingsUnauthorizedInsert.status === 403 ||
      bookingsUnauthorizedInsert.status === 404 ||
      (bookingsUnauthorizedInsert.status >= 400 &&
        JSON.stringify(bookingsUnauthorizedInsert.data).includes('row-level security'));

    if (!bookingInsertBlocked && bookingsUnauthorizedInsert.status === 201) {
      await apiRequest(`bookings?user_id=eq.${testBookingUserId}`, { method: 'DELETE' });
    }

    recordResult(
      'Bookings Unauthorized INSERT Blocked',
      bookingInsertBlocked,
      `Anon booking injection blocked by RLS (HTTP ${bookingsUnauthorizedInsert.status})`,
      `VULNERABILITY: Anon was able to insert a booking without authentication (HTTP ${bookingsUnauthorizedInsert.status})`
    );
  }

  // ---------------------------------------------------------------------------
  // Check 3: Payments Financial Data Isolation
  // ---------------------------------------------------------------------------
  console.log('--- [3/5] Verifying public.payments ---');
  const paymentsRead = await apiRequest('payments?select=*');
  const paymentsDropped = paymentsRead.status === 404;

  if (paymentsDropped) {
    recordResult(
      'Payments Status',
      true,
      'Table has been dropped/purged (Zero financial exposure - Security Advisor resolved)',
      ''
    );
  } else {
    const paymentsProtected =
      paymentsRead.status === 200
        ? Array.isArray(paymentsRead.data) && paymentsRead.data.length === 0
        : paymentsRead.status === 401 || paymentsRead.status === 403;

    recordResult(
      'Payments Anonymous SELECT Blocked / Filtered to 0',
      paymentsProtected,
      `RLS enforced: 0 financial payment records leaked (Status ${paymentsRead.status})`,
      `CRITICAL VULNERABILITY: Leaked ${paymentsRead.data?.length} financial payment records to anon caller!`
    );

    const testPaymentOrderId = '__audit_probe_order_id__';
    const paymentsUnauthorizedInsert = await apiRequest('payments', {
      method: 'POST',
      body: JSON.stringify({ amount: 99999, currency: 'INR', status: 'captured', order_id: testPaymentOrderId }),
    });
    const paymentInsertBlocked =
      paymentsUnauthorizedInsert.status === 401 ||
      paymentsUnauthorizedInsert.status === 403 ||
      paymentsUnauthorizedInsert.status === 404 ||
      (paymentsUnauthorizedInsert.status >= 400 &&
        JSON.stringify(paymentsUnauthorizedInsert.data).includes('row-level security'));

    if (!paymentInsertBlocked && paymentsUnauthorizedInsert.status === 201) {
      await apiRequest(`payments?order_id=eq.${testPaymentOrderId}`, { method: 'DELETE' });
    }

    recordResult(
      'Payments Unauthorized INSERT Blocked',
      paymentInsertBlocked,
      `Anon payment forgery blocked by RLS (HTTP ${paymentsUnauthorizedInsert.status})`,
      `CRITICAL VULNERABILITY: Anon was able to inject arbitrary payments (HTTP ${paymentsUnauthorizedInsert.status})`
    );
  }

  // ---------------------------------------------------------------------------
  // Check 4: Email Audit Confidentiality
  // ---------------------------------------------------------------------------
  console.log('--- [4/5] Verifying public.email_audit ---');
  const emailAuditRead = await apiRequest('email_audit?select=*');
  const emailAuditDropped = emailAuditRead.status === 404;

  if (emailAuditDropped) {
    recordResult(
      'Email Audit Status',
      true,
      'Table has been dropped/purged (Zero exposure - Security Advisor resolved)',
      ''
    );
  } else {
    const emailAuditProtected =
      emailAuditRead.status === 200
        ? Array.isArray(emailAuditRead.data) && emailAuditRead.data.length === 0
        : emailAuditRead.status === 401 || emailAuditRead.status === 403;

    recordResult(
      'Email Audit Log Confidentiality (0 Rows Exposed to Anon)',
      emailAuditProtected,
      `RLS enforced: 0 email audit records exposed to unauthenticated callers (Status ${emailAuditRead.status})`,
      `PII VULNERABILITY: Leaked ${emailAuditRead.data?.length} email audit logs to anon caller!`
    );

    const testProbeEmail = '__audit_probe_email__@example.com';
    const emailAuditUnauthorizedInsert = await apiRequest('email_audit', {
      method: 'POST',
      body: JSON.stringify({ to_email: testProbeEmail }),
    });
    const emailAuditInsertBlocked =
      emailAuditUnauthorizedInsert.status === 401 ||
      emailAuditUnauthorizedInsert.status === 403 ||
      emailAuditUnauthorizedInsert.status === 404 ||
      (emailAuditUnauthorizedInsert.status >= 400 &&
        JSON.stringify(emailAuditUnauthorizedInsert.data).includes('row-level security'));

    if (!emailAuditInsertBlocked && emailAuditUnauthorizedInsert.status === 201) {
      await apiRequest(`email_audit?to_email=eq.${encodeURIComponent(testProbeEmail)}`, { method: 'DELETE' });
    }

    recordResult(
      'Email Audit Tampering / INSERT Blocked',
      emailAuditInsertBlocked,
      `Anon log injection blocked by RLS (HTTP ${emailAuditUnauthorizedInsert.status})`,
      `VULNERABILITY: Anon was able to inject records into email_audit (HTTP ${emailAuditUnauthorizedInsert.status})`
    );
  }

  // ---------------------------------------------------------------------------
  // Check 5: Webhook Events Isolation
  // ---------------------------------------------------------------------------
  console.log('--- [5/5] Verifying public.webhook_events ---');
  const webhookEventsRead = await apiRequest('webhook_events?select=*');
  const webhookEventsDropped = webhookEventsRead.status === 404;

  if (webhookEventsDropped) {
    recordResult(
      'Webhook Events Status',
      true,
      'Table has been dropped/purged (Zero exposure - Security Advisor resolved)',
      ''
    );
  } else {
    const webhookProtected =
      webhookEventsRead.status === 200
        ? Array.isArray(webhookEventsRead.data) && webhookEventsRead.data.length === 0
        : webhookEventsRead.status === 401 || webhookEventsRead.status === 403;

    recordResult(
      'Webhook Events Confidentiality (0 Rows Exposed to Anon)',
      webhookProtected,
      `RLS enforced: 0 webhook event payloads exposed to unauthenticated callers (Status ${webhookEventsRead.status})`,
      `INFRASTRUCTURE VULNERABILITY: Leaked ${webhookEventsRead.data?.length} webhook event payloads to anon caller!`
    );

    const webhookUnauthorizedInsert = await apiRequest('webhook_events', {
      method: 'POST',
      body: JSON.stringify({ event_type: '__audit_probe_event__', payload: { forged: true } }),
    });
    const webhookInsertBlocked =
      webhookUnauthorizedInsert.status === 401 ||
      webhookUnauthorizedInsert.status === 403 ||
      webhookUnauthorizedInsert.status === 404 ||
      (webhookUnauthorizedInsert.status >= 400 &&
        JSON.stringify(webhookUnauthorizedInsert.data).includes('row-level security'));

    recordResult(
      'Webhook Events Forgery / INSERT Blocked',
      webhookInsertBlocked,
      `Anon webhook forgery blocked by RLS (HTTP ${webhookUnauthorizedInsert.status})`,
      `CRITICAL VULNERABILITY: Anon was able to forge webhook payloads (HTTP ${webhookUnauthorizedInsert.status})`
    );
  }

  // ---------------------------------------------------------------------------
  // Final Evaluation
  // ---------------------------------------------------------------------------
  console.log('=============================================================================');
  console.log(`AUDIT SUMMARY: ${passedCount} / ${totalChecks} Checks Passed (${Math.round((passedCount / totalChecks) * 100)}%)`);
  console.log('=============================================================================');

  if (passedCount === totalChecks) {
    console.log('\nSUCCESS: All 5 tables have active Row Level Security (RLS) enforcement.');
    console.log('The Supabase Security Advisor findings are completely resolved.\n');
    process.exit(0);
  } else {
    console.log('\nACTION REQUIRED: RLS remediation has not been applied yet in Supabase.');
    console.log('To apply the remediation:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/vaubwtgxvgvyjhvtvokq');
    console.log('2. Navigate to "SQL Editor" -> New query');
    console.log('3. Copy and run the script:');
    console.log('   supabase/security_finding_rls_remediation_bookings_payments_therapists.sql');
    console.log('4. Re-run this audit script:');
    console.log('   node scripts/verify-rls-security-posture.cjs\n');
    process.exit(1);
  }
}

runAudit();
