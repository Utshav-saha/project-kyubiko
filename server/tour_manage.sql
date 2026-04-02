-- Tour booking and revenue utilities for Kyubiko
-- Do not run automatically in app startup.

-- 1) Booking processor
-- Takes user_id and tour_id, prevents duplicate booking by the same user on same tour,
-- finds an available time slot, creates unique ticket code, inserts booking,
-- updates total_bookings, and returns the ticket code.
CREATE OR REPLACE FUNCTION process_tour_booking(p_user_id INT, p_tour_id INT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_time_slot_id INT;
  v_ticket_code TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM bookings
    WHERE user_id = p_user_id
      AND tour_id = p_tour_id
  ) THEN
    RAISE EXCEPTION 'User already booked this tour';
  END IF;

  SELECT ts.time_slot_id
  INTO v_time_slot_id
  FROM time_slots ts
  WHERE ts.tour_id = p_tour_id
    AND COALESCE(ts.total_bookings, 0) < ts.capacity
  ORDER BY ts.start_time ASC
  LIMIT 1;

  IF v_time_slot_id IS NULL THEN
    RAISE EXCEPTION 'No available seats for this tour';
  END IF;

  LOOP
    v_ticket_code := 'TK-' || upper(substr(md5(clock_timestamp()::text || random()::text), 1, 12));
    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE ticket_code = v_ticket_code
    );
  END LOOP;

  INSERT INTO bookings (ticket_code, user_id, tour_id, time_slot_id)
  VALUES (v_ticket_code, p_user_id, p_tour_id, v_time_slot_id);

  UPDATE time_slots
  SET total_bookings = COALESCE(total_bookings, 0) + 1
  WHERE time_slot_id = v_time_slot_id;

  RETURN v_ticket_code;
END;
$$;

-- 2) Revenue calculator by time slot
-- Multiplies the slot's total_bookings with tour price.
CREATE OR REPLACE FUNCTION calculate_time_slot_revenue(p_time_slot_id INT)
RETURNS DECIMAL(12,2)
LANGUAGE sql
AS $$
  SELECT (COALESCE(ts.total_bookings, 0) * COALESCE(t.price, 0))::DECIMAL(12,2)
  FROM time_slots ts
  JOIN tours t ON t.tour_id = ts.tour_id
  WHERE ts.time_slot_id = p_time_slot_id
  LIMIT 1;
$$;
