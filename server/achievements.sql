-- Achievements trigger file

CREATE OR REPLACE FUNCTION award_achievement_once(
	p_user_id INTEGER,
	p_title VARCHAR,
	p_description TEXT,
	p_badge_url TEXT
)
RETURNS VOID AS $$
BEGIN
	IF p_user_id IS NULL THEN
		RETURN;
	END IF;

	-- Insert only if this user doesn't already have this same achievement title.
	INSERT INTO achievements (achievement_title, description, badge_url, user_id)
	SELECT p_title, p_description, p_badge_url, p_user_id
	WHERE NOT EXISTS (
		SELECT 1
		FROM achievements a
		WHERE a.user_id = p_user_id
		  AND a.achievement_title = p_title
	);
END;
$$ LANGUAGE plpgsql;


-- 1) Give achievement once user has 10 artifact entries across their mini-museums.
CREATE OR REPLACE FUNCTION check_10_artifacts_achievement(p_user_id INTEGER)
RETURNS VOID AS $$
DECLARE
	v_total_artifacts INTEGER;
BEGIN
	IF p_user_id IS NULL THEN
		RETURN;
	END IF;

	SELECT COUNT(*)::INTEGER
	INTO v_total_artifacts
	FROM sections s
	JOIN mini_museums mm ON mm.mini_museum_id = s.mini_museum_id
	WHERE mm.curator_id = p_user_id
	  AND s.artifact_id IS NOT NULL;

	IF COALESCE(v_total_artifacts, 0) >= 10 THEN
		PERFORM award_achievement_once(
			p_user_id,
			'Artifact Architect',
			'Inserted 10 artifacts across mini museums.',
			'badge_artifact_architect'
		);
	END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_award_10_artifacts()
RETURNS TRIGGER AS $$
DECLARE
	v_curator_id INTEGER;
BEGIN
	-- We only care about rows that actually have an artifact attached.
	IF NEW.artifact_id IS NOT NULL THEN
		SELECT curator_id INTO v_curator_id
		FROM mini_museums
		WHERE mini_museum_id = NEW.mini_museum_id;

		PERFORM check_10_artifacts_achievement(v_curator_id);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_10_artifacts ON sections;
CREATE TRIGGER trigger_award_10_artifacts
AFTER INSERT OR UPDATE OF artifact_id, mini_museum_id ON sections
FOR EACH ROW
EXECUTE FUNCTION trg_award_10_artifacts();


-- 2) Give achievement after creating 5 mini museums.
CREATE OR REPLACE FUNCTION trg_award_5_mini_museums()
RETURNS TRIGGER AS $$
DECLARE
	v_mini_museum_count INTEGER;
BEGIN
	SELECT COUNT(*)::INTEGER
	INTO v_mini_museum_count
	FROM mini_museums
	WHERE curator_id = NEW.curator_id;

	IF COALESCE(v_mini_museum_count, 0) >= 5 THEN
		PERFORM award_achievement_once(
			NEW.curator_id,
			'Pop Up Pioneer',
			'Created 5 mini museums.',
			'badge_pop_up_pioneer'
		);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_5_mini_museums ON mini_museums;
CREATE TRIGGER trigger_award_5_mini_museums
AFTER INSERT ON mini_museums
FOR EACH ROW
EXECUTE FUNCTION trg_award_5_mini_museums();


-- 3) Give achievement when the user is top 3 for that museum's quiz leaderboard.
CREATE OR REPLACE FUNCTION trg_award_quiz_top3()
RETURNS TRIGGER AS $$
DECLARE
	v_museum_id INTEGER;
	v_user_rank INTEGER;
BEGIN
	SELECT q.museum_id
	INTO v_museum_id
	FROM quizzes q
	WHERE q.quiz_id = NEW.quiz_id;

	IF v_museum_id IS NULL THEN
		RETURN NEW;
	END IF;

	WITH best_per_user AS (
		SELECT
			uq.user_id,
			COALESCE(uq.score, 0) AS points,
			COALESCE(uq.completion_time, 999999) AS completion_time,
			ROW_NUMBER() OVER (
				PARTITION BY uq.user_id
				ORDER BY
					COALESCE(uq.score, 0) DESC,
					COALESCE(uq.completion_time, 999999) ASC,
					uq.user_quiz_id DESC
			) AS rn
		FROM user_quiz uq
		JOIN quizzes q ON q.quiz_id = uq.quiz_id
		WHERE q.museum_id = v_museum_id
	), ranked AS (
		SELECT
			pub.user_id,
			DENSE_RANK() OVER (
				ORDER BY pub.points DESC, pub.completion_time ASC, pub.user_id ASC
			) AS leaderboard_rank
		FROM best_per_user pub
		WHERE pub.rn = 1
	)
	SELECT r.leaderboard_rank
	INTO v_user_rank
	FROM ranked r
	WHERE r.user_id = NEW.user_id;

	IF COALESCE(v_user_rank, 999999) <= 3 THEN
		PERFORM award_achievement_once(
			NEW.user_id,
			'Kyurious Curator',
			'Reached top 3 in a museum quiz leaderboard.',
			'badge_kyurious_curator'
		);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_quiz_top3 ON user_quiz;
CREATE TRIGGER trigger_award_quiz_top3
AFTER INSERT OR UPDATE ON user_quiz
FOR EACH ROW
EXECUTE FUNCTION trg_award_quiz_top3();
