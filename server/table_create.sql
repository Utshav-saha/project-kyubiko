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
  start_year INTEGER,
  end_year INTEGER,
  origin VARCHAR(100),

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

CREATE TABLE artifacts_views (
    artifact_view_id SERIAL,
    view_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    artifact_id INTEGER,
    
    CONSTRAINT artifacts_views_pkey PRIMARY KEY (artifact_view_id),
    
    CONSTRAINT artifacts_views_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES users (user_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT artifacts_views_artifact_id_fkey 
        FOREIGN KEY (artifact_id) 
        REFERENCES artifacts (artifact_id) 
        ON DELETE CASCADE
);



CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    mini_museum_id INTEGER NOT NULL, 
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    artifact_id INTEGER,
    
    FOREIGN KEY (mini_museum_id) REFERENCES mini_museums(mini_museum_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(artifact_id) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE museum_daily_stats (
    stat_id SERIAL PRIMARY KEY,
    museum_id INTEGER REFERENCES museums(museum_id) ON DELETE CASCADE,
    stat_date DATE DEFAULT CURRENT_DATE,
    daily_views INTEGER DEFAULT 0,
    daily_additions INTEGER DEFAULT 0,
    daily_bookings INTEGER DEFAULT 0,
    UNIQUE(museum_id, stat_date)
);

-- // triggers
create or replace function check_duplicate_artifact() 
returns trigger as $$
begin
    if exists (
        select 1 
        from artifacts 
        where artifact_name = new.artifact_name
        and creator = new.creator
        and origin = new.origin
    ) then
    
        return null;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger prevent_duplicate_artifact
before insert on artifacts
for each row
execute function check_duplicate_artifact();

-- artifact view count trigger - 1 for each users unique view
create or replace function increment_count()
returns trigger as $$
begin
    update artifacts
    set artifact_views = artifact_views + 1
    where artifact_id = new.artifact_id;
    return new;
end;
$$ language plpgsql;

create trigger increase_view_count
after insert on artifacts_views
for each row
execute function increment_count();


-- keep latest 20 artifact views for each user
create or replace function last_10_records()
returns trigger as $$
begin
    delete from artifacts_views
    where artifact_view_id in (
        select artifact_view_id
        from artifacts_views
        where user_id = new.user_id
        order by view_time desc
        offset 20 // -- 21 no ta ashbe 
    )
    return new;
end;
$$ language plpgsql;

create or replace trigger limit_views
after insert on artifacts_views
for each row
execute function last_10_records();



-- // stats triggers 

-- // on conflict = same date thakle update , else insert 

create or replace function update_daily_views_stats()
returns trigger as $$
declare
    v_museum_id integer;
begin
    select museum_id into v_museum_id from artifacts where artifact_id = new.artifact_id;

    if v_museum_id is not null then
        
        insert into museum_daily_stats (museum_id, stat_date, daily_views)
        values (v_museum_id, current_date, 1)
        on conflict (museum_id, stat_date)
        do update set daily_views = museum_daily_stats.daily_views + 1;
    end if;

    return new;
end;
$$ language plpgsql;
create or replace trigger trigger_daily_museum_views
after insert on artifacts_views
for each row
execute function update_daily_views_stats();



create or replace function update_daily_additions_stats()
returns trigger as $$
declare
    v_museum_id integer;
begin
    select museum_id into v_museum_id from artifacts where artifact_id = new.artifact_id;

    if v_museum_id is not null then
        
        insert into museum_daily_stats (museum_id, stat_date, daily_additions)
        values (v_museum_id, current_date, 1)
        on conflict (museum_id, stat_date)
        do update set daily_additions = museum_daily_stats.daily_additions + 1;
    end if;

    return new;
end;
$$ language plpgsql;
create or replace trigger trigger_daily_museum_additions
after insert on sections
for each row
execute function update_daily_additions_stats();



create or replace function update_daily_bookings_stats()
returns trigger as $$
declare
    v_museum_id integer;
begin
    select museum_id into v_museum_id from tours where tour_id = new.tour_id;

    if v_museum_id is not null then
        
        insert into museum_daily_stats (museum_id, stat_date, daily_bookings)
        values (v_museum_id, current_date, 1)
        on conflict (museum_id, stat_date)
        do update set daily_bookings = museum_daily_stats.daily_bookings + 1;
    end if;

    return new;
end;
$$ language plpgsql;
create or replace trigger trigger_daily_museum_bookings
after insert on bookings
for each row
execute function update_daily_bookings_stats();


-- // functions
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


create or replace function get_position(p_museum_id integer)
returns integer as $$
declare
    max_position integer;
begin
    select max(position) into max_position
    from sections
    where mini_museum_id = p_museum_id;
    return coalesce(max_position, 0) + 1;
end;
$$ language plpgsql;


create or replace function get_location_id(
    p_location_id integer,
    p_city varchar,
    p_country varchar,
    p_latitude decimal,
    p_longitude decimal
)
returns integer as $$
declare
    v_country_id integer;
    v_location_id integer;
begin

    if p_location_id is not null then
        return p_location_id;
    end if;

    if p_city is null or trim(p_city) = '' or p_country is null or trim(p_country) = '' then
        return null;
    end if;

    --  check country
    select country_id into v_country_id 
    from country 
    where lower(name) = lower(trim(p_country)) 
    limit 1;

    if v_country_id is null then
        insert into country (name) 
        values (trim(p_country)) 
        returning country_id into v_country_id;
    end if;

    --  check city
    select location_id into v_location_id 
    from locations 
    where lower(city) = lower(trim(p_city)) 
    and country_id = v_country_id 
    limit 1;

    if v_location_id is not null then
        -- update coordinates 
        update locations
        set latitude = coalesce(p_latitude, latitude),
            longitude = coalesce(p_longitude, longitude)
        where location_id = v_location_id;
        
        return v_location_id;
    else
        -- insert new 
        insert into locations (city, latitude, longitude, country_id)
        values (trim(p_city), p_latitude, p_longitude, v_country_id)
        returning location_id into v_location_id;
    
        return v_location_id;
    end if;
end;
$$ language plpgsql;


// -- procedures

create or replace procedure create_ques_ops(
    in p_quiz_id int,
    in p_question_text text,
    in p_options text[],
    in p_correct_index int,
    in p_image_url text,
    in p_question_description text,
    out p_question_id int
)
as $$
declare
    i int;
begin

    insert into questions (quiz_id, question_text, image_url, question_description)
    values (p_quiz_id, p_question_text, p_image_url, p_question_description)
    returning question_id into p_question_id;
    
    for i in 1 .. array_length(p_options, 1) loop

        insert into options (question_id, option_text, is_correct)
        values (p_question_id, p_options[i], (i - 1) = p_correct_index);

    end loop;

end;
$$ language plpgsql;



// -- complex queries

-- fetch data for mini museums with sections and artifacts
select 
            'section-' || s.position as id, 
            s.name,
            coalesce(
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
                ) filter (where a.artifact_id is not null),
                '[]'::json
            ) as items
        from sections s
        left join artifacts a on s.artifact_id = a.artifact_id
        left join categories cat on a.category_id = cat.category_id
        where s.mini_museum_id = $1
        group by s.name, s.position, s.mini_museum_id
        order by s.position asc;


// --  suggest artifacts

with user_history as (
    select artifact_id
    from artifacts_views
    where user_id = $1

    union

    select s.artifact_id
    from sections s
    join mini_museums mm on s.mini_museum_id = mm.mini_museum_id
    where mm.curator_id = $1
      and s.artifact_id is not null
),
user_preferences as (
    select
        a.category_id,
        avg((a.start_year + a.end_year) / 2.0) as avg_year,
        count(*) as category_weight
    from user_history uh
    join artifacts a on uh.artifact_id = a.artifact_id
    where a.start_year is not null and a.end_year is not null
    group by a.category_id
)
select
    a.artifact_id,
    a.artifact_name,
    a.description,
    a.creator,
    a.time_period,
    a.picture_url,
    a.origin,
    a.acquisition_date,
    a.category_id,
    c.category_name,
    a.start_year,
    a.end_year,
    abs(((a.start_year + a.end_year) / 2.0) - up.avg_year) as era_diff
from artifacts a
join user_preferences up on a.category_id = up.category_id
left join categories c on a.category_id = c.category_id
where a.start_year is not null
  and a.end_year is not null
  and not exists (
      select 1
      from sections s
      join mini_museums mm on s.mini_museum_id = mm.mini_museum_id
      where mm.curator_id = $1
        and s.artifact_id = a.artifact_id
  )
order by
    up.category_weight desc,
    era_diff asc
limit 5;


