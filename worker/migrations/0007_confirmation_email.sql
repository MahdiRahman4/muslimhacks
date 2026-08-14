-- NULL means the "application received" email has not reached Resend yet, so a
-- later save retries it instead of silently leaving the applicant with no receipt.
ALTER TABLE applications ADD COLUMN confirmation_email_sent_at INTEGER;
