-- Quiz setup for Met Museum quiz (quiz_id = 1)
-- Ensure total questions (used by frontend as quiz length)
UPDATE quizzes
SET total_points = 10
WHERE quiz_id = 1;

-- 10 questions: 3 museum-level + 7 artifact-level
INSERT INTO questions (question_text, image_url, question_description, quiz_id)
VALUES
(
  'In which city is The Metropolitan Museum of Art located?',
  'https://images.metmuseum.org/CRDImages/ad/original/DP346475.jpg',
  'The Met is in New York City and is one of the largest and most visited museums in the world.',
  1
),
(
  'In which year was The Metropolitan Museum of Art founded?',
  'https://images.metmuseum.org/CRDImages/ad/original/DP346475.jpg',
  'The museum was founded in 1870 with the goal of bringing art and education to the public.',
  1
),
(
  'Which major area is especially famous inside The Met?',
  'https://images.metmuseum.org/CRDImages/ad/original/DP346475.jpg',
  'The Met''s Department of Egyptian Art is especially famous and includes the Temple of Dendur.',
  1
),
(
  'Who painted ''The Harvesters''?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  'The Harvesters is by Pieter Bruegel the Elder, created in 1565, and is one of The Met''s most celebrated works.',
  1
),
(
  'Which object is shown in ''Aristotle with a Bust of Homer''?',
  'https://images.metmuseum.org/CRDImages/ep/original/DP145973.jpg',
  'The painting by Rembrandt shows Aristotle resting his hand on a bust of Homer.',
  1
),
(
  'Who is the artist of ''Madame X (Madame Pierre Gautreau)''?',
  'https://images.metmuseum.org/CRDImages/ap/original/DT1919.jpg',
  'Madame X was painted by John Singer Sargent and became one of his most famous portraits.',
  1
),
(
  'What kind of artwork is ''Washington Crossing the Delaware''?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  'Washington Crossing the Delaware is a monumental historical painting by Emanuel Leutze.',
  1
),
(
  'The ''Temple of Dendur'' at The Met originally came from which country?',
  'https://images.metmuseum.org/CRDImages/ad/original/DT891.jpg',
  'The Temple of Dendur is an ancient Egyptian monument and is one of the museum''s signature installations.',
  1
),
(
  'Which artist created ''Ugolino and His Sons''?',
  'https://images.metmuseum.org/CRDImages/sc/original/DP-14915-001.jpg',
  'Ugolino and His Sons is a dramatic sculpture by Jean-Baptiste Carpeaux.',
  1
),
(
  'What best describes ''The Unicorn Rests in a Garden''?',
  'https://images.metmuseum.org/CRDImages/cl/original/DT1567.jpg',
  'It is one of the famed Unicorn Tapestries and is a woven textile masterpiece at The Met.',
  1
);

-- Options for each inserted question
INSERT INTO options (option_text, is_correct, question_id)
VALUES
('London', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which city is The Metropolitan Museum of Art located?' LIMIT 1)),
('New York City', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which city is The Metropolitan Museum of Art located?' LIMIT 1)),
('Paris', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which city is The Metropolitan Museum of Art located?' LIMIT 1)),
('Tokyo', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which city is The Metropolitan Museum of Art located?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('1789', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which year was The Metropolitan Museum of Art founded?' LIMIT 1)),
('1870', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which year was The Metropolitan Museum of Art founded?' LIMIT 1)),
('1905', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which year was The Metropolitan Museum of Art founded?' LIMIT 1)),
('1923', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'In which year was The Metropolitan Museum of Art founded?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Astronomy Lab', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which major area is especially famous inside The Met?' LIMIT 1)),
('Egyptian Art', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which major area is especially famous inside The Met?' LIMIT 1)),
('Modern Robotics', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which major area is especially famous inside The Met?' LIMIT 1)),
('Automobile Design', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which major area is especially famous inside The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Pieter Bruegel the Elder', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Harvesters''?' LIMIT 1)),
('Claude Monet', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Harvesters''?' LIMIT 1)),
('Vincent van Gogh', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Harvesters''?' LIMIT 1)),
('Raphael', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Harvesters''?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('A sword', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which object is shown in ''Aristotle with a Bust of Homer''?' LIMIT 1)),
('A globe', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which object is shown in ''Aristotle with a Bust of Homer''?' LIMIT 1)),
('A bust of Homer', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which object is shown in ''Aristotle with a Bust of Homer''?' LIMIT 1)),
('A violin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which object is shown in ''Aristotle with a Bust of Homer''?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('John Singer Sargent', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the artist of ''Madame X (Madame Pierre Gautreau)''?' LIMIT 1)),
('Edgar Degas', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the artist of ''Madame X (Madame Pierre Gautreau)''?' LIMIT 1)),
('Paul Cezanne', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the artist of ''Madame X (Madame Pierre Gautreau)''?' LIMIT 1)),
('Mary Cassatt', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the artist of ''Madame X (Madame Pierre Gautreau)''?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('A sculpture', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What kind of artwork is ''Washington Crossing the Delaware''?' LIMIT 1)),
('A historical painting', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What kind of artwork is ''Washington Crossing the Delaware''?' LIMIT 1)),
('A ceramic tile', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What kind of artwork is ''Washington Crossing the Delaware''?' LIMIT 1)),
('A manuscript page', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What kind of artwork is ''Washington Crossing the Delaware''?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Greece', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'The ''Temple of Dendur'' at The Met originally came from which country?' LIMIT 1)),
('Egypt', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'The ''Temple of Dendur'' at The Met originally came from which country?' LIMIT 1)),
('Italy', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'The ''Temple of Dendur'' at The Met originally came from which country?' LIMIT 1)),
('Peru', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'The ''Temple of Dendur'' at The Met originally came from which country?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Auguste Rodin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''Ugolino and His Sons''?' LIMIT 1)),
('Jean-Baptiste Carpeaux', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''Ugolino and His Sons''?' LIMIT 1)),
('Gian Lorenzo Bernini', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''Ugolino and His Sons''?' LIMIT 1)),
('Henry Moore', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''Ugolino and His Sons''?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('A silver coin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What best describes ''The Unicorn Rests in a Garden''?' LIMIT 1)),
('A wall tapestry', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What best describes ''The Unicorn Rests in a Garden''?' LIMIT 1)),
('An oil sketchbook', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What best describes ''The Unicorn Rests in a Garden''?' LIMIT 1)),
('A marble bust', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'What best describes ''The Unicorn Rests in a Garden''?' LIMIT 1));

-- 10 additional artifact-level questions for Met Museum quiz
INSERT INTO questions (question_text, image_url, question_description, quiz_id)
VALUES
(
  'Who painted ''Self-Portrait with a Straw Hat'' at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DP118882.jpg',
  'Self-Portrait with a Straw Hat was painted by Vincent van Gogh in 1887 during his Paris period.',
  1
),
(
  'Who is the painter of ''The Death of Socrates'' in The Met collection?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1025.jpg',
  'The Death of Socrates was painted by Jacques-Louis David in 1787.',
  1
),
(
  'Which artist created ''The Musicians'' displayed at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  'The Musicians is a work by Caravaggio from around 1595.',
  1
),
(
  'Who painted ''Young Woman with a Water Pitcher'' at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1467.jpg',
  'Young Woman with a Water Pitcher was painted by Johannes Vermeer around 1662.',
  1
),
(
  'Which artist painted ''The Dance Class'' in The Met''s collection?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1547.jpg',
  'The Dance Class is by Edgar Degas and reflects his deep interest in ballet scenes.',
  1
),
(
  'Who painted ''Joan of Arc'' at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1967.jpg',
  'Joan of Arc was painted by Jules Bastien-Lepage in 1879.',
  1
),
(
  'Which artist created ''The Horse Fair'' now at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1367.jpg',
  'The Horse Fair is a monumental painting by Rosa Bonheur completed in the 1850s.',
  1
),
(
  'Who painted ''The Gulf Stream'' in The Met collection?',
  'https://images.metmuseum.org/CRDImages/ap/original/DT1567.jpg',
  'The Gulf Stream is one of Winslow Homer''s most famous marine paintings.',
  1
),
(
  'Which sculptor created ''Adam'' at The Metropolitan Museum of Art?',
  'https://images.metmuseum.org/CRDImages/sc/original/DT9017.jpg',
  'Adam is a marble sculpture by Tullio Lombardo from the Renaissance period.',
  1
),
(
  'Who painted ''Autumn Rhythm (Number 30)'' shown at The Met?',
  'https://images.metmuseum.org/CRDImages/ep/original/DT1947.jpg',
  'Autumn Rhythm (Number 30) is a celebrated abstract expressionist painting by Jackson Pollock.',
  1
);

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Vincent van Gogh', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Self-Portrait with a Straw Hat'' at The Met?' LIMIT 1)),
('Paul Gauguin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Self-Portrait with a Straw Hat'' at The Met?' LIMIT 1)),
('Henri Matisse', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Self-Portrait with a Straw Hat'' at The Met?' LIMIT 1)),
('Camille Pissarro', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Self-Portrait with a Straw Hat'' at The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Jacques-Louis David', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the painter of ''The Death of Socrates'' in The Met collection?' LIMIT 1)),
('Jean-Auguste-Dominique Ingres', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the painter of ''The Death of Socrates'' in The Met collection?' LIMIT 1)),
('Eugene Delacroix', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the painter of ''The Death of Socrates'' in The Met collection?' LIMIT 1)),
('Nicolas Poussin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who is the painter of ''The Death of Socrates'' in The Met collection?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Caravaggio', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Musicians'' displayed at The Met?' LIMIT 1)),
('Titian', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Musicians'' displayed at The Met?' LIMIT 1)),
('El Greco', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Musicians'' displayed at The Met?' LIMIT 1)),
('Giorgione', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Musicians'' displayed at The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Johannes Vermeer', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Young Woman with a Water Pitcher'' at The Met?' LIMIT 1)),
('Pieter de Hooch', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Young Woman with a Water Pitcher'' at The Met?' LIMIT 1)),
('Frans Hals', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Young Woman with a Water Pitcher'' at The Met?' LIMIT 1)),
('Jan Steen', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Young Woman with a Water Pitcher'' at The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Edgar Degas', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist painted ''The Dance Class'' in The Met''s collection?' LIMIT 1)),
('Edouard Manet', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist painted ''The Dance Class'' in The Met''s collection?' LIMIT 1)),
('Pierre-Auguste Renoir', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist painted ''The Dance Class'' in The Met''s collection?' LIMIT 1)),
('Berthe Morisot', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist painted ''The Dance Class'' in The Met''s collection?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Jules Bastien-Lepage', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Joan of Arc'' at The Met?' LIMIT 1)),
('Gustave Courbet', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Joan of Arc'' at The Met?' LIMIT 1)),
('Jean-Leon Gerome', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Joan of Arc'' at The Met?' LIMIT 1)),
('William Bouguereau', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Joan of Arc'' at The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Rosa Bonheur', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Horse Fair'' now at The Met?' LIMIT 1)),
('Eugene Fromentin', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Horse Fair'' now at The Met?' LIMIT 1)),
('Jean-Francois Millet', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Horse Fair'' now at The Met?' LIMIT 1)),
('Honore Daumier', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which artist created ''The Horse Fair'' now at The Met?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Winslow Homer', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Gulf Stream'' in The Met collection?' LIMIT 1)),
('Thomas Eakins', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Gulf Stream'' in The Met collection?' LIMIT 1)),
('George Inness', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Gulf Stream'' in The Met collection?' LIMIT 1)),
('Childe Hassam', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''The Gulf Stream'' in The Met collection?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Tullio Lombardo', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which sculptor created ''Adam'' at The Metropolitan Museum of Art?' LIMIT 1)),
('Donatello', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which sculptor created ''Adam'' at The Metropolitan Museum of Art?' LIMIT 1)),
('Andrea del Verrocchio', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which sculptor created ''Adam'' at The Metropolitan Museum of Art?' LIMIT 1)),
('Luca della Robbia', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Which sculptor created ''Adam'' at The Metropolitan Museum of Art?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Jackson Pollock', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Autumn Rhythm (Number 30)'' shown at The Met?' LIMIT 1)),
('Mark Rothko', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Autumn Rhythm (Number 30)'' shown at The Met?' LIMIT 1)),
('Willem de Kooning', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Autumn Rhythm (Number 30)'' shown at The Met?' LIMIT 1)),
('Barnett Newman', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 1 AND question_text = 'Who painted ''Autumn Rhythm (Number 30)'' shown at The Met?' LIMIT 1));
