-- One-off backfill of phone numbers captured by Twilio Verify between
-- 2026-02-24 and 2026-04-24, before the silent-failure bug in
-- ComingSoon.tsx was fixed. Source: Twilio SMS log export.
--
-- All numbers normalized to E.164 (+1 prepended where missing for US).
-- All marked verified=false because none of the OTP messages were
-- successfully delivered (Twilio returned ErrorCode 21212 on every send).
--
-- Run AFTER migration 002_newsletter_subscribers_rls.sql.
-- Safe to re-run: ON CONFLICT DO NOTHING preserves any existing rows.

INSERT INTO newsletter_subscribers (phone_number, verified, created_at) VALUES
    ('+12149181581', false, '2026-02-24 08:35:12-08'),
    ('+14699873223', false, '2026-02-24 08:35:27-08'),
    ('+14243549774', false, '2026-02-27 16:56:34-08'),
    ('+18178568474', false, '2026-02-27 21:38:51-08'),
    ('+16825579954', false, '2026-02-27 21:50:15-08'),
    ('+16824035956', false, '2026-02-27 21:53:14-08'),
    ('+15403599573', false, '2026-02-27 21:53:25-08'),
    ('+12145021675', false, '2026-02-27 21:53:48-08'),
    ('+17147683248', false, '2026-02-27 21:53:48-08'),
    ('+12814551455', false, '2026-02-27 21:58:01-08'),
    ('+13468126260', false, '2026-02-27 21:58:24-08'),
    ('+13238756778', false, '2026-02-27 23:10:56-08'),
    ('+19492146416', false, '2026-02-28 00:50:57-08'),
    ('+16024058928', false, '2026-03-01 20:10:28-08'),
    ('+19726930243', false, '2026-03-01 20:10:47-08'),
    ('+13134027466', false, '2026-03-01 20:10:52-08'),
    ('+17077180727', false, '2026-03-01 20:10:55-08'),
    ('+14806739498', false, '2026-03-01 20:11:25-08'),
    ('+16232903722', false, '2026-03-01 20:27:51-08'),
    ('+14696582891', false, '2026-03-01 20:27:54-08'),
    ('+16232626638', false, '2026-03-01 21:01:54-08'),
    ('+13179275525', false, '2026-03-01 22:19:37-08'),
    ('+19513266084', false, '2026-03-01 22:36:20-08'),
    ('+13303167027', false, '2026-03-01 22:46:59-08'),
    ('+12149188592', false, '2026-03-06 07:02:06-08')
ON CONFLICT (phone_number) DO NOTHING;

-- Verify the result
SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE verified) AS verified_count
FROM newsletter_subscribers;
