create table users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR (100) UNIQUE NOT NULL,
    email VARCHAR (150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR (20) NOT NULL 
    avatar_url TEXT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE country (
    country_id SERIAL PRIMARY KEY,
    name VARCHAR (50) UNIQUE NOT NULL
);

INSERT INTO country (NAME)
VALUES 
('test_country');


CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    city VARCHAR (50) UNIQUE NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL (11,8),
    country_id INTEGER REFERENCES country(country_id) ON DELETE CASCADE
);

INSERT INTO locations (city, country_id, latitude, longitude)
VALUES 
('test_city', 1, 1.234, -5.234);




CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR (50) UNIQUE NOT NULL
);

INSERT INTO categories (category_name)
VALUES 
('test_category');



CREATE TABLE museums (
    museum_id SERIAL PRIMARY KEY,
    museum_name VARCHAR (50) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  open_days VARCHAR(100) NOT NULL,
  picture_url TEXT,

  location_id INTEGER REFERENCES locations(location_id) on delete CASCADE,
  manager_id INTEGER UNIQUE REFERENCES users(user_id) on delete CASCADE
  
  
);

INSERT INTO museums(museum_name , description , category , open_days, location_id, manager_id )
VALUES 
('test_name', 'abcdyfguhijopk', 'Art' , 'Sun , Mon , Tues', 1 , 2);



CREATE TABLE artifacts (
    artifact_id SERIAL PRIMARY KEY,
    artifact_name VARCHAR (200) NOT NULL,
  description TEXT,
  creator VARCHAR(50) ,
  time_period VARCHAR(100) ,
  picture_url TEXT,
  acquisition_date DATE,
  artifact_views INTEGER DEFAULT 0, 

  museum_id INTEGER REFERENCES museums(museum_id) on delete CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL
  
  
);
INSERT INTO artifacts(artifact_name , description , creator , time_period, acquisition_date, museum_id, category_id )
VALUES 
('test_artifact', 'This is a test artifact description', 'test_creator' , 'Medieval', '2023-01-01', 1 , 1);



create table favorites (
    favorite_id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE,
    artifact_id INTEGER REFERENCES artifacts(artifact_id) on delete CASCADE
);
INSERT INTO favorites (user_id, artifact_id)
VALUES
(2, 1);


create table artifacts_views(
    artifact_view_id SERIAL PRIMARY KEY,
    view_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE,
    artifact_id INTEGER REFERENCES artifacts(artifact_id) on delete CASCADE
);
INSERT INTO artifacts_views (user_id, artifact_id)
VALUES
(2, 1);


CREATE table mini_museums (
    mini_museum_id SERIAL PRIMARY KEY,
    mini_museum_name VARCHAR(100) NOT NULL,
    description TEXT,
    picture_url TEXT,
    likes_count INTEGER DEFAULT 0,

    curator_id INTEGER REFERENCES users(user_id) on delete CASCADE
);

INSERT INTO mini_museums (mini_museum_name, description, curator_id)
VALUES
('test_mini_museum', 'This is a test mini museum description', 1);


CREATE table reviews (
    review_id SERIAL PRIMARY KEY,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    review_body TEXT,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE,
    artifact_id INTEGER REFERENCES artifacts(artifact_id) on delete CASCADE,
    reply_id INTEGER REFERENCES reviews(review_id) on delete CASCADE
);

INSERT INTO reviews (stars, review_body, user_id, artifact_id)
VALUES
(5, 'This is a test review.', 2, 1);
INSERT INTO reviews (stars, review_body, user_id, artifact_id, reply_id)
VALUES
(4, 'This is a test reply to the review.', 1, 1, 1);


create table quizzes (
    quiz_id SERIAL PRIMARY KEY,
    quiz_title VARCHAR(100) NOT NULL,
    total_points INTEGER DEFAULT 0,

    museum_id INTEGER REFERENCES museums(museum_id) on delete CASCADE
);

INSERT INTO quizzes (quiz_title, total_points, museum_id)
VALUES
('test_quiz', 100, 1);

create table questions (
    question_id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    image_url TEXT,
    question_description TEXT,

    quiz_id INTEGER REFERENCES quizzes(quiz_id) on delete CASCADE
);

INSERT INTO questions (question_text, quiz_id)
VALUES
('What is the capital of test_country?', 1);

create table options (
    option_id SERIAL PRIMARY KEY,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,

    question_id INTEGER REFERENCES questions(question_id) on delete CASCADE
);
INSERT INTO options (option_text, is_correct, question_id)
VALUES
('test_option_1', FALSE, 1),
('test_option_2', TRUE, 1),
('test_option_3', FALSE, 1),
('test_option_4', FALSE, 1);


create table user_quiz(
    user_quiz_id SERIAL PRIMARY KEY,
    score INTEGER DEFAULT 0,
    completion_time DECIMAL(10,2),
    total_attempts INTEGER DEFAULT 0,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE,
    quiz_id INTEGER REFERENCES quizzes(quiz_id) on delete CASCADE
);
INSERT INTO user_quiz (score, completion_time, user_id, quiz_id)
VALUES
(80, 9.999, 2, 1);


create table achievements (
    achievement_id SERIAL PRIMARY KEY,
    achievement_title VARCHAR(100) NOT NULL,
    description TEXT,
    badge_url TEXT NOT NULL,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE
);
INSERT INTO achievements (achievement_title, description, badge_url, user_id)
VALUES
('test_achievement', 'This is a test achievement description', 'test_badge_url', 1);


create table tours (
    tour_id SERIAL PRIMARY KEY,
    tour_title VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    tour_date DATE NOT NULL,
    museum_id INTEGER REFERENCES museums(museum_id) on delete CASCADE
);


INSERT INTO tours (tour_title, price, tour_date, museum_id)
VALUES
('test_tour', 20.00, '2026-01-01', 1);


create table time_slots (
    time_slot_id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL,
    total_bookings INTEGER DEFAULT 0,
    slot_color INTEGER DEFAULT 0 CHECK (slot_color BETWEEN 0 AND 11),

    tour_id INTEGER REFERENCES tours(tour_id) on delete CASCADE
);

INSERT INTO time_slots (start_time, end_time, capacity, slot_color, tour_id)
VALUES
('10:00:00', '12:00:00', 20, 0, 1);

create table bookings (
    booking_id SERIAL PRIMARY KEY,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ticket_code VARCHAR(100) UNIQUE NOT NULL,

    user_id INTEGER REFERENCES users(user_id) on delete CASCADE,
    tour_id INTEGER REFERENCES tours(tour_id) on delete CASCADE,
    time_slot_id INTEGER REFERENCES time_slots(time_slot_id) on delete CASCADE
);

INSERT INTO bookings (ticket_code, user_id, tour_id, time_slot_id)
VALUES
('TESTTICKET123', 2, 1, 1);



CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    mini_museum_id INTEGER NOT NULL, 
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    artifact_id INTEGER,
    
    FOREIGN KEY (mini_museum_id) REFERENCES mini_museums(mini_museum_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(artifact_id) ON DELETE CASCADE ON UPDATE CASCADE
)

-- // Triggers
CREATE OR REPLACE FUNCTION check_duplicate_artifact() 
returns TRIGGER AS $$
BEGIN
    if EXISTS (
        SELECT 1 
        FROM artifacts 
        WHERE artifact_name = NEW.artifact_name
        AND creator = NEW.creator
        AND origin = NEW.origin
    ) then
    
        return null;
    END if;

    return NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_artifact
BEFORE INSERT ON artifacts
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_artifact();

-- artifact view count trigger - 1 for each users unique view
CREATE OR REPLACE FUNCTION increment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ARTIFACTS
    SET ARTIFACT_VIEWS = ARTIFACT_VIEWS + 1
    WHERE ARTIFACT_ID = NEW.ARTIFACT_ID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increase_view_count
AFTER INSERT ON ARTIFACTS_VIEWS
FOR EACH ROW
EXECUTE FUNCTION increment_count();


-- keep latest 20 artifact views for each user
CREATE OR REPLACE FUNCTION last_10_records()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM ARTIFACTS_VIEWS
    WHERE ARTIFACT_VIEW_ID IN (
        SELECT ARTIFACT_VIEW_ID
        FROM ARTIFACTS_VIEWS
        WHERE USER_ID = NEW.USER_ID
        ORDER BY VIEW_TIME DESC
        OFFSET 20 // -- 21 no ta ashbe 
    )
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER LIMIT_VIEWS
AFTER INSERT ON ARTIFACTS_VIEWS
FOR EACH ROW
EXECUTE FUNCTION last_10_records();


-- // Functions
create or replace function get_category(p_department varchar)
returns integer as $$
declare
    v_category_id integer;
    v_dept varchar(100);
begin
    if p_department is null or trim(p_department) = '' 
    then
        return null; 
    end if;

    v_dept := lower(p_department);

    -- search for existing categories
    if v_dept like '%photo%' then
        return 2;
    elsif v_dept like '%sculpture%' then
        return 3;
    elsif v_dept like '%art%' then
        return 4;
    elsif v_dept like '%instrument%' then
        return 5;
    end if;

    select category_id into v_category_id
    from categories
    where lower(category_name) = v_dept 
    limit 1;
    

    if v_category_id is not null then
        return v_category_id; 
    end if;

    -- create new category if not found
    insert into categories (category_name)
    values (p_department)
    returning category_id into v_category_id;

    return v_category_id;
end;
$$ language plpgsql


CREATE OR REPLACE FUNCTION GET_POSITION(p_museum_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    max_position INTEGER;
BEGIN
    SELECT MAX(position) INTO max_position
    FROM sections
    WHERE mini_museum_id = p_museum_id;
    RETURN COALESCE(max_position, 0) + 1;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_location_id(
    p_location_id INTEGER,
    p_city VARCHAR,
    p_country VARCHAR,
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS INTEGER AS $$
DECLARE
    v_country_id INTEGER;
    v_location_id INTEGER;
BEGIN

    IF p_location_id IS NOT NULL THEN
        RETURN p_location_id;
    END IF;

    IF p_city IS NULL OR TRIM(p_city) = '' OR p_country IS NULL OR TRIM(p_country) = '' THEN
        RETURN NULL;
    END IF;

    --  Check Country
    SELECT country_id INTO v_country_id 
    FROM country 
    WHERE LOWER(name) = LOWER(TRIM(p_country)) 
    LIMIT 1;

    IF v_country_id IS NULL THEN
        INSERT INTO country (name) 
        VALUES (TRIM(p_country)) 
        RETURNING country_id INTO v_country_id;
    END IF;

    --  Check City
    SELECT location_id INTO v_location_id 
    FROM locations 
    WHERE LOWER(city) = LOWER(TRIM(p_city)) 
    AND country_id = v_country_id 
    LIMIT 1;

    IF v_location_id IS NOT NULL THEN
        -- Update coordinates 
        UPDATE locations
        SET latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude)
        WHERE location_id = v_location_id;
        
        RETURN v_location_id;
    ELSE
        -- Insert new 
        INSERT INTO locations (city, latitude, longitude, country_id)
        VALUES (TRIM(p_city), p_latitude, p_longitude, v_country_id)
        RETURNING location_id INTO v_location_id;
    
        RETURN v_location_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


// -- Procedures

CREATE OR REPLACE PROCEDURE create_ques_ops(
    IN p_quiz_id INT,
    IN p_question_text TEXT,
    IN p_options TEXT[],
    IN p_correct_index INT,
    IN p_image_url TEXT,
    IN p_question_description TEXT,
    OUT p_question_id INT
)
AS $$
DECLARE
    i INT;
BEGIN

    INSERT INTO questions (quiz_id, question_text, image_url, question_description)
    VALUES (p_quiz_id, p_question_text, p_image_url, p_question_description)
    RETURNING question_id INTO p_question_id;
    
    FOR i IN 1 .. array_length(p_options, 1) LOOP

        INSERT INTO options (question_id, option_text, is_correct)
        VALUES (p_question_id, p_options[i], (i - 1) = p_correct_index);

    END LOOP;

END;
$$ LANGUAGE plpgsql;






// -- Complex Queries

-- fetch data for mini museums with sections and artifacts
SELECT 
            'section-' || s.position AS id, 
            s.name,
            COALESCE(
                json_agg(
                    json_build_object(
                        'artifact_id', a.artifact_id,
                        'name', a.artifact_name, 
                        'image', a.picture_url,  
                        'description', a.description,
                        'creator', a.creator,
                        'time_period', a.time_period,
                        'acquisition_date', a.acquisition_date,
                        'origin', a.origin,
                        'category_name', cat.category_name
                    ) 
                ) FILTER (WHERE a.artifact_id IS NOT NULL),
                '[]'::json
            ) AS items
        FROM sections s
        LEFT JOIN artifacts a ON s.artifact_id = a.artifact_id
        LEFT JOIN categories cat ON a.category_id = cat.category_id
        WHERE s.mini_museum_id = $1
        GROUP BY s.name, s.position, s.mini_museum_id
        ORDER BY s.position ASC;


// --  Suggest Artifacts


