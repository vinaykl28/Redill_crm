-- ==============================================================================
-- RED HILL INFRA CRM - SEED DATA
-- HSR Layout, Bengaluru
-- ==============================================================================

-- 1. SEED PROFILES (Fixed UUIDs for consistent testing and references)
-- Note: When running in live Supabase auth, these UUIDs match auth.users(id).
INSERT INTO public.profiles (id, full_name, email, role, phone, department)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Rajesh Reddy', 'rajesh.reddy@redhillinfra.in', 'admin', '+91 99001 11222', 'Executive Leadership'),
    ('b0000000-0000-0000-0000-000000000002', 'Priya Sharma', 'priya.sharma@redhillinfra.in', 'manager', '+91 98450 33444', 'Sales & Operations'),
    ('c0000000-0000-0000-0000-000000000003', 'Amit Kumar', 'amit.kumar@redhillinfra.in', 'telecaller', '+91 97410 55666', 'Telecalling & Pre-sales'),
    ('d0000000-0000-0000-0000-000000000004', 'Sneha Patel', 'sneha.patel@redhillinfra.in', 'telecaller', '+91 96200 77888', 'Telecalling & Pre-sales'),
    ('e0000000-0000-0000-0000-000000000005', 'Karthik Nair', 'karthik.nair@redhillinfra.in', 'telecaller', '+91 95350 99000', 'Telecalling & Pre-sales')
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = EXCLUDED.email;

-- 2. SEED LEADS
INSERT INTO public.leads (id, name, phone, email, source, campaign_name, project_interested, budget, status, non_conversion_reason, non_conversion_notes, notes, assigned_to, created_at)
VALUES
    -- Converted Leads
    ('11111111-1111-1111-1111-111111111101', 'Vikramaditya Hegde', '+91 98860 12045', 'vikram.hegde@techlead.io', 'Meta Ads', 'Meta_HSR_Luxury_Apts_Q1', 'Red Hill Heights (HSR)', '1.5 Cr - 2.5 Cr', 'converted', NULL, NULL, 'VP of Eng at Bellandur tech firm. Booked 3BHK Unit 402 with 10% token.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '14 days'),
    ('11111111-1111-1111-1111-111111111102', 'Ananya Deshmukh', '+91 97422 34091', 'ananya.d@fintech.co', 'Google Ads', 'Google_Search_Villas_Sarjapur', 'Red Hill Meadows (Sarjapur-HSR)', '1 Cr - 1.5 Cr', 'converted', NULL, NULL, 'Looking for East-facing villa plot. Paid booking advance.', 'd0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '10 days'),
    ('11111111-1111-1111-1111-111111111103', 'Sunil Narang', '+91 99160 45123', 'sunil.narang@startup.in', 'Meta Ads', 'Meta_Instagram_Penthouse_Stories', 'Red Hill Serenity', '2.5 Cr+', 'converted', NULL, NULL, 'Penthouse booked on 14th floor with private terrace deck.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '7 days'),

    -- Site Visit Scheduled Leads
    ('11111111-1111-1111-1111-111111111104', 'Deepak Venkatesh', '+91 98440 78192', 'deepak.v@consulting.com', 'Google Ads', 'Google_HSR_2BHK_Search', 'Red Hill Heights (HSR)', '1 Cr - 1.5 Cr', 'site_visit_scheduled', NULL, NULL, 'Confirmed site visit for Saturday morning with family. Innova car arranged.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days'),
    ('11111111-1111-1111-1111-111111111105', 'Meera Krishnan', '+91 96112 89045', 'meera.k@biotech.ac.in', 'MagicBricks', 'MagicBricks_HSR_Verified_Leads', 'Red Hill Meadows (Sarjapur-HSR)', '75L - 1 Cr', 'site_visit_scheduled', NULL, NULL, 'Interested in 2400 sqft plot. Requested escort by relationship manager.', 'e0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '4 days'),
    ('11111111-1111-1111-1111-111111111106', 'Rohan Sengupta', '+91 95380 44102', 'rohan.sen@cloudcorp.com', 'WhatsApp Ads', 'WhatsApp_Weekend_OpenHouse', 'Red Hill Heights (HSR)', '1.5 Cr - 2.5 Cr', 'site_visit_scheduled', NULL, NULL, 'Visiting Sunday 3 PM. Needs cab pickup from HSR Sector 2.', 'd0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 days'),

    -- Interested Leads
    ('11111111-1111-1111-1111-111111111107', 'Kavita Menon', '+91 99002 67890', 'kavita.m@pharma.org', 'Meta Ads', 'Meta_FB_HSR_Families', 'Red Hill Heights (HSR)', '1 Cr - 1.5 Cr', 'interested', NULL, NULL, 'Liked brochure and floor plan. Discussing with husband, requested callback Friday.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days'),
    ('11111111-1111-1111-1111-111111111108', 'Arjun Bansal', '+91 98801 23456', 'arjun.b@retailchain.com', 'Housing.com', 'Housing_Exclusive_Promos', 'Red Hill Commercial ORR', '2.5 Cr+', 'interested', NULL, NULL, 'Evaluating 1500 sqft retail space on ORR. Requested ROI calculation sheet.', 'e0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '2 days'),

    -- Contacted Leads
    ('11111111-1111-1111-1111-111111111109', 'Naveen Rao', '+91 97400 98765', 'naveen.rao@globalit.com', 'Google Ads', 'Google_PerformanceMax_Bangalore', 'Red Hill Heights (HSR)', '1 Cr - 1.5 Cr', 'contacted', NULL, NULL, 'Called once. Asked to call back after 7 PM as he was in office meetings.', 'd0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111110', 'Pooja Bhatt', '+91 96860 55432', 'pooja.bhatt@edutech.io', 'Meta Ads', 'Meta_HSR_Luxury_Apts_Q1', 'Red Hill Serenity', '1.5 Cr - 2.5 Cr', 'contacted', NULL, NULL, 'Spoke for 4 mins. Sent WhatsApp brochure. Follow-up scheduled for tomorrow.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day'),

    -- New Leads
    ('11111111-1111-1111-1111-111111111111', 'Raghavendra Joshi', '+91 99720 11234', 'raghav.joshi@designstudio.in', 'Meta Ads', 'Meta_HSR_Luxury_Apts_Q1', 'Red Hill Heights (HSR)', '1 Cr - 1.5 Cr', 'new', NULL, NULL, 'Fresh ad click lead from Instagram form. Uncalled.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 hours'),
    ('11111111-1111-1111-1111-111111111112', 'Shruti Iyer', '+91 98451 99887', 'shruti.iyer@fintechhub.com', 'Google Ads', 'Google_HSR_2BHK_Search', 'Red Hill Meadows (Sarjapur-HSR)', '75L - 1 Cr', 'new', NULL, NULL, 'Google search lead inquiry for gated community plots.', 'd0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '2 hours'),
    ('11111111-1111-1111-1111-111111111113', 'Gaurav Agarwal', '+91 96110 33221', 'gaurav.a@venturecap.com', 'Website', 'Organic_Web_Landing_Page', 'Red Hill Heights (HSR)', '1.5 Cr - 2.5 Cr', 'new', NULL, NULL, 'Submitted web inquiry form directly on website.', 'e0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 hour'),

    -- Not Interested Leads (with reasons)
    ('11111111-1111-1111-1111-111111111114', 'Sanjay Kulkarni', '+91 97412 88776', 'sanjay.k@automotive.com', 'Meta Ads', 'Meta_HSR_Luxury_Apts_Q1', 'Red Hill Heights (HSR)', '50L - 75L', 'not_interested', 'Budget mismatch', 'Client maximum budget is 60 Lakhs all-inclusive. Our starting ticket is 1.45 Cr.', 'Budget cannot be stretched.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '8 days'),
    ('11111111-1111-1111-1111-111111111115', 'Tanvi Mathur', '+91 99800 66554', 'tanvi.m@lawchambers.in', 'Google Ads', 'Google_Search_Villas_Sarjapur', 'Red Hill Meadows (Sarjapur-HSR)', '1 Cr - 1.5 Cr', 'not_interested', 'Location mismatch (wants outside HSR)', 'Client strictly wants Whitefield / ITPL corridor due to kid schooling.', 'Location mismatch.', 'd0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '6 days'),
    ('11111111-1111-1111-1111-111111111116', 'Abhishek Varma', '+91 98444 32109', 'abhi.varma@consultancy.com', '99acres', '99acres_Sponsored_Listing', 'Red Hill Heights (HSR)', '1.5 Cr - 2.5 Cr', 'not_interested', 'Bought competitor property', 'Already finalized an apartment at Sobha Dream Acres last week.', 'Closed with competitor.', 'e0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '5 days'),
    ('11111111-1111-1111-1111-111111111117', 'Pranav Nair', '+91 95355 43210', 'pranav.n@mediacorp.in', 'Meta Ads', 'Meta_Instagram_Penthouse_Stories', 'Red Hill Serenity', '2.5 Cr+', 'not_interested', 'Delayed plan (6+ months)', 'Current lease ends next year. Might revisit in Q4.', 'Postponed plan.', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CALLS LOG
INSERT INTO public.calls (id, lead_id, caller_id, call_outcome, notes, duration_seconds, follow_up_date, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000003', 'connected', 'First introductory call. Discussed 3BHK layout and HSR Sector 1 connectivity. Client very keen.', 320, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000003', 'site_visit_requested', 'Site visit booked for unit 402. Arranged Innova pickup.', 240, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111104', 'c0000000-0000-0000-0000-000000000003', 'connected', 'Explained pricing breakdown, clubhouse amenities, and possession date (Dec 2026). Client wants Saturday morning visit.', 410, NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'd0000000-0000-0000-0000-000000000004', 'connected', 'Explained gated community approvals (BMRDA & RERA). Client requested legal title verification copy.', 380, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
    ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111107', 'c0000000-0000-0000-0000-000000000003', 'follow_up_scheduled', 'Discussed 2.5 BHK floor plan. Husband is working in EcoSpace ORR. Scheduled callback for Friday 4 PM.', 290, NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111109', 'd0000000-0000-0000-0000-000000000004', 'busy', 'Customer was in a sprint review meeting. Requested call after 7 PM.', 45, NOW() + INTERVAL '4 hours', NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111114', 'c0000000-0000-0000-0000-000000000003', 'disqualified', 'Budget cap is 60L. Disqualified politely as starting units exceed 1.45 Cr.', 180, NULL, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SITE VISITS
INSERT INTO public.site_visits (id, lead_id, project_name, scheduled_date, status, vehicle_type, vehicle_number, driver_name, driver_phone, escort_id, escort_name, pickup_location, party_size, visit_notes, feedback)
VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'Red Hill Heights (HSR)', NOW() - INTERVAL '10 days', 'completed', 'Innova Crysta (AC)', 'KA-01-MJ-4589', 'Ramesh Gowda', '+91 98450 12345', 'b0000000-0000-0000-0000-000000000002', 'Priya Sharma (Manager)', 'Koramangala 4th Block, near Wipro Park', 3, 'Client attended with spouse and architect friend. Loved ventilation in Unit 402.', 'Superb site experience. Converted on spot with token!'),
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111104', 'Red Hill Heights (HSR)', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 'scheduled', 'Innova Crysta (AC)', 'KA-01-MJ-4589', 'Ramesh Gowda', '+91 98450 12345', 'c0000000-0000-0000-0000-000000000003', 'Amit Kumar', 'HSR Layout Sector 1, BDA Complex', 2, 'Pick up from BDA Complex at 10 AM. Showcase sample flat and gym amenity area.', NULL),
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111105', 'Red Hill Meadows (Sarjapur-HSR)', NOW() + INTERVAL '3 days' + INTERVAL '11 hours', 'scheduled', 'Honda City (Executive)', 'KA-05-AB-7744', 'Manjunath Swamy', '+91 97410 88990', 'e0000000-0000-0000-0000-000000000005', 'Karthik Nair', 'Bellandur EcoSpace Main Gate', 2, 'Showcase Phase 1 villa plots 12 to 18 facing park.', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED DOCUMENTS
INSERT INTO public.documents (id, title, description, file_url, file_type, file_size_kb, category, is_company_document, lead_id, uploaded_by)
VALUES
    ('44444444-4444-4444-4444-444444444401', 'Red Hill Heights - Official Master Brochure.pdf', 'High-res brochure with floor plans, luxury amenities, specification sheets and RERA certificate PRM/KA/RERA/1251/310/PR/210323/004033', '/docs/red_hill_heights_brochure.pdf', 'pdf', 4850, 'brochure', true, NULL, 'a0000000-0000-0000-0000-000000000001'),
    ('44444444-4444-4444-4444-444444444402', 'Red Hill Meadows - Villa Plot Master Plan.pdf', 'Gated community layout, 40ft wide roads, underground cabling, clubhouse specs', '/docs/red_hill_meadows_masterplan.pdf', 'pdf', 3200, 'brochure', true, NULL, 'a0000000-0000-0000-0000-000000000001'),
    ('44444444-4444-4444-4444-444444444403', 'Red Hill Infra - Standard Flat Booking Application Form.pdf', 'Official allotment application form with terms, milestones, and bank ESCROW account details', '/docs/red_hill_booking_form_v2.pdf', 'pdf', 1150, 'booking_form', true, NULL, 'b0000000-0000-0000-0000-000000000002'),
    ('44444444-4444-4444-4444-444444444404', 'Cost Sheet - Red Hill Heights HSR 3BHK (Typical).xlsx', 'Breakdown of basic price, car parking, clubhouse charges, BESCOM/BWSSB, GST and registration estimate', '/docs/cost_sheet_3bhk_hsr.xlsx', 'excel', 420, 'cost_sheet', true, NULL, 'b0000000-0000-0000-0000-000000000002'),
    ('44444444-4444-4444-4444-444444444405', 'Vikramaditya Hegde - Signed Booking Form & Token Cheque.pdf', 'Booking form for Flat 402, Red Hill Heights with PAN & Aadhaar KYC copies attached', '/docs/signed_form_vikram_hegde.pdf', 'pdf', 2600, 'booking_form', false, '11111111-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;
