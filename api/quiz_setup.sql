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

-- Quiz setup for Louvre quiz (quiz_id = 5)
UPDATE quizzes
SET total_points = 10
WHERE quiz_id = 5;

-- 12 questions: 4 Louvre-level + 8 artifact-level
INSERT INTO questions (question_text, image_url, question_description, quiz_id)
VALUES
(
  'In which city is the Louvre Museum located?',
  'https://res.cloudinary.com/djiuqhg6i/image/upload/v1775235828/louvre_museum_cbv681.jpg',
  'The Louvre Museum is located in Paris, France, and is one of the most visited museums in the world.',
  5
),
(
  'Which former building now houses the Louvre Museum?',
  'https://res.cloudinary.com/djiuqhg6i/image/upload/v1775235828/louvre_museum_cbv681.jpg',
  'The Louvre was originally a royal palace before becoming a public museum.',
  5
),
(
  'Which iconic glass structure is in the Louvre courtyard?',
  'https://res.cloudinary.com/djiuqhg6i/image/upload/v1775235828/louvre_museum_cbv681.jpg',
  'The Louvre Pyramid serves as a modern entrance to the museum.',
  5
),
(
  'The Louvre is located on the banks of which river?',
  'https://res.cloudinary.com/djiuqhg6i/image/upload/v1775235828/louvre_museum_cbv681.jpg',
  'The museum stands on the Right Bank of the Seine in central Paris.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000062370/0000868046_OG.JPG',
  'This is Leonardo da Vinci''s celebrated portrait known as the Mona Lisa.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000065566/0000752986_OG.JPG',
  'This is La Grande Odalisque by Jean-Auguste-Dominique Ingres.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000277627/0000625031_OG.JPG',
  'This is the Venus de Milo, an ancient Greek marble statue associated with Aphrodite.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000062167/0001314706_OG.JPG',
  'This is Portrait of Charles I at the Hunt by Anthony van Dyck.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000066819/0000405627_OG.JPG',
  'This is Oriental Merchants in a Western Port by Theodore Chasseriau.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000065579/0001008375_OG.JPG',
  'This is Menagere saxonne by Charles-Francois Hutin.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000059083/0000900340_OG.JPG',
  'This is Le Sommeil des Amours from the studio of Francois Boucher.',
  5
),
(
  'Which artwork is shown in this image?',
  'https://collections.louvre.fr/media/cache/medium/0000000021/0000065571/0000684363_OG.JPG',
  'This is La Tabagie (Le Corps de garde), associated with the Le Nain circle.',
  5
);

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Paris', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'In which city is the Louvre Museum located?' LIMIT 1)),
('London', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'In which city is the Louvre Museum located?' LIMIT 1)),
('Rome', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'In which city is the Louvre Museum located?' LIMIT 1)),
('Madrid', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'In which city is the Louvre Museum located?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Royal palace', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which former building now houses the Louvre Museum?' LIMIT 1)),
('Railway station', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which former building now houses the Louvre Museum?' LIMIT 1)),
('Fortified church', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which former building now houses the Louvre Museum?' LIMIT 1)),
('University campus', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which former building now houses the Louvre Museum?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Glass Pyramid', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which iconic glass structure is in the Louvre courtyard?' LIMIT 1)),
('Arc de Triomphe', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which iconic glass structure is in the Louvre courtyard?' LIMIT 1)),
('Eiffel Tower Annex', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which iconic glass structure is in the Louvre courtyard?' LIMIT 1)),
('Grand Obelisk', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which iconic glass structure is in the Louvre courtyard?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Seine', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'The Louvre is located on the banks of which river?' LIMIT 1)),
('Thames', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'The Louvre is located on the banks of which river?' LIMIT 1)),
('Tiber', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'The Louvre is located on the banks of which river?' LIMIT 1)),
('Danube', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'The Louvre is located on the banks of which river?' LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Mona Lisa', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 0 LIMIT 1)),
('The Wedding at Cana', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 0 LIMIT 1)),
('Liberty Leading the People', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 0 LIMIT 1)),
('The Raft of the Medusa', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 0 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('La Grande Odalisque', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 1 LIMIT 1)),
('Mona Lisa', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 1 LIMIT 1)),
('The Coronation of Napoleon', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 1 LIMIT 1)),
('Venus de Milo', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 1 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Venus de Milo', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 2 LIMIT 1)),
('Winged Victory of Samothrace', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 2 LIMIT 1)),
('Dying Slave', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 2 LIMIT 1)),
('Psyche Revived by Cupid''s Kiss', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 2 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Portrait of Charles I at the Hunt', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 3 LIMIT 1)),
('The Night Watch', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 3 LIMIT 1)),
('Las Meninas', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 3 LIMIT 1)),
('The Arnolfini Portrait', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 3 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Oriental Merchants in a Western Port', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 4 LIMIT 1)),
('The Oath of the Horatii', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 4 LIMIT 1)),
('Napoleon Crossing the Alps', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 4 LIMIT 1)),
('The Death of Marat', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 4 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Menagere saxonne', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 5 LIMIT 1)),
('The Lacemaker', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 5 LIMIT 1)),
('The Milkmaid', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 5 LIMIT 1)),
('Woman with a Water Jug', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 5 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Le Sommeil des Amours', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 6 LIMIT 1)),
('Cupid and Psyche', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 6 LIMIT 1)),
('The Birth of Venus', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 6 LIMIT 1)),
('The Swing', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 6 LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('La Tabagie', TRUE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 7 LIMIT 1)),
('The Card Sharp with the Ace of Diamonds', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 7 LIMIT 1)),
('The Fortune Teller', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 7 LIMIT 1)),
('The Musicians', FALSE, (SELECT question_id FROM questions WHERE quiz_id = 5 AND question_text = 'Which artwork is shown in this image?' ORDER BY question_id ASC OFFSET 7 LIMIT 1));

-- Quiz setup for Tokyo National Museum / Japanese artifacts (museum_id = 3)
UPDATE quizzes
SET total_points = 20
WHERE quiz_id = 6;

INSERT INTO questions (question_text, image_url, question_description, quiz_id)
VALUES
(
  'In which city is the Tokyo National Museum located?',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Tokyo_National_Museum_Honkan_2010.jpg',
  'Tokyo National Museum is located in Taito, Tokyo, inside Ueno Park.',
  6
),
(
  'In which year was the Tokyo National Museum founded?',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Tokyo_National_Museum_Honkan_2010.jpg',
  'The museum was founded in 1872 and is widely recognized as Japan''s oldest national museum.',
  6
),
(
  'Tokyo National Museum is located in which famous park area?',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Tokyo_National_Museum_Honkan_2010.jpg',
  'The museum campus is situated in Ueno Park, a major cultural district in Tokyo.',
  6
),
(
  'Who is credited for ''National Museum-Ante Spatti Etatem II''?',
  'https://search.artmuseums.go.jp/jpeg/small/momat/S0117080.jpg',
  'The work is attributed to Yasuda Haruhiko.',
  6
),
(
  'Which airport is featured in ''(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane''?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/514235-L.jpg',
  'The title explicitly identifies Haneda International Airport.',
  6
),
(
  '''View of Hakone, Fuji Hakone National Park'' is connected with which country?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/492404-L.jpg',
  'This artifact set is cataloged with origin listed as Japan.',
  6
),
(
  'What is the core theme stated in the title ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.''?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/510159-L.jpg',
  'The title highlights international communications as its central message.',
  6
),
(
  'The poster ''Amnesty International / YOKOO, Tadanori (1936 - )'' references which organization?',
  'https://search.artmuseums.go.jp/jpeg/small/momak/ot0089-044.jpg',
  'This work directly names Amnesty International in its title.',
  6
),
(
  'The work ''THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951'' commemorates which year?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/503832-L.jpg',
  'The year 1951 appears explicitly in the title.',
  6
),
(
  'Which labor federation is named in ''War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.''?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/504455-L.jpg',
  'The title identifies the International Federation of Trade Unions.',
  6
),
(
  'In ''Court of Honor, Imperial International Exhibition, London, 1909'', which city is named?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/512865-L.jpg',
  'The title points to London as the exhibition city.',
  6
),
(
  'In ''(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies'', what is the gateway?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/514236-L.jpg',
  'The title describes Haneda International Airport as the gateway.',
  6
),
(
  'What distinction is announced in ''The International Jury of Awards Has Conferred a Grand Prize''?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/503853-L.jpg',
  'The text states that a Grand Prize has been conferred.',
  6
),
(
  'Who is listed as creator for ''FRANCIS PICABIA 1999-2000 APT INTERNATIO''?',
  'https://museumcollection.tokyo/wp-content/uploads/2023/11/24520.jpg',
  'The record lists YOKOO Tadanori as creator.',
  6
),
(
  'Who is the creator of ''Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )''?',
  'https://search.artmuseums.go.jp/jpeg/small/momat/s0190117.jpg',
  'This work is credited to Ina Eiji.',
  6
),
(
  'The title ''Shinbashi, Minato-ku from In Tokyo'' identifies which ward?',
  'https://search.artmuseums.go.jp/jpeg/small/momat/s0191009.jpg',
  'Minato-ku is explicitly named in the title.',
  6
),
(
  'The title ''Shibaura, Minato-ku from In Tokyo'' identifies which ward?',
  'https://search.artmuseums.go.jp/jpeg/small/momat/s0191001.jpg',
  'Shibaura is presented as part of Minato-ku in the title.',
  6
),
(
  'The poster ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.'' is cataloged under which time period?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/510159-L.jpg',
  'Its record labels the period as 20世紀 (20th century).',
  6
),
(
  'The Amnesty International work by YOKOO Tadanori is from which year?',
  'https://search.artmuseums.go.jp/jpeg/small/momak/ot0089-044.jpg',
  'The record date for this item is 1976.',
  6
),
(
  'The work ''Court of Honor, Imperial International Exhibition, London, 1909'' is recorded with which bracketed year?',
  'https://museumcollection.tokyo/wp-content/uploads/2025/07/512865-L.jpg',
  'The catalog time period is given as [1910].',
  6
);

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Tokyo', TRUE, (SELECT question_id FROM questions WHERE question_text = 'In which city is the Tokyo National Museum located?' ORDER BY question_id DESC LIMIT 1)),
('Osaka', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which city is the Tokyo National Museum located?' ORDER BY question_id DESC LIMIT 1)),
('Kyoto', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which city is the Tokyo National Museum located?' ORDER BY question_id DESC LIMIT 1)),
('Nagoya', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which city is the Tokyo National Museum located?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('1872', TRUE, (SELECT question_id FROM questions WHERE question_text = 'In which year was the Tokyo National Museum founded?' ORDER BY question_id DESC LIMIT 1)),
('1868', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which year was the Tokyo National Museum founded?' ORDER BY question_id DESC LIMIT 1)),
('1905', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which year was the Tokyo National Museum founded?' ORDER BY question_id DESC LIMIT 1)),
('1945', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In which year was the Tokyo National Museum founded?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Ueno Park', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Tokyo National Museum is located in which famous park area?' ORDER BY question_id DESC LIMIT 1)),
('Yoyogi Park', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Tokyo National Museum is located in which famous park area?' ORDER BY question_id DESC LIMIT 1)),
('Shinjuku Gyoen', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Tokyo National Museum is located in which famous park area?' ORDER BY question_id DESC LIMIT 1)),
('Hibiya Park', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Tokyo National Museum is located in which famous park area?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Yasuda Haruhiko', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Who is credited for ''National Museum-Ante Spatti Etatem II''?' ORDER BY question_id DESC LIMIT 1)),
('Yokoo Tadanori', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is credited for ''National Museum-Ante Spatti Etatem II''?' ORDER BY question_id DESC LIMIT 1)),
('Ina Eiji', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is credited for ''National Museum-Ante Spatti Etatem II''?' ORDER BY question_id DESC LIMIT 1)),
('Unknown Artist', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is credited for ''National Museum-Ante Spatti Etatem II''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Haneda International Airport', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Which airport is featured in ''(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane''?' ORDER BY question_id DESC LIMIT 1)),
('Narita International Airport', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which airport is featured in ''(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane''?' ORDER BY question_id DESC LIMIT 1)),
('Kansai International Airport', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which airport is featured in ''(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane''?' ORDER BY question_id DESC LIMIT 1)),
('Chubu Centrair International Airport', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which airport is featured in ''(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Japan', TRUE, (SELECT question_id FROM questions WHERE question_text = '''View of Hakone, Fuji Hakone National Park'' is connected with which country?' ORDER BY question_id DESC LIMIT 1)),
('China', FALSE, (SELECT question_id FROM questions WHERE question_text = '''View of Hakone, Fuji Hakone National Park'' is connected with which country?' ORDER BY question_id DESC LIMIT 1)),
('South Korea', FALSE, (SELECT question_id FROM questions WHERE question_text = '''View of Hakone, Fuji Hakone National Park'' is connected with which country?' ORDER BY question_id DESC LIMIT 1)),
('Thailand', FALSE, (SELECT question_id FROM questions WHERE question_text = '''View of Hakone, Fuji Hakone National Park'' is connected with which country?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('International communications', TRUE, (SELECT question_id FROM questions WHERE question_text = 'What is the core theme stated in the title ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.''?' ORDER BY question_id DESC LIMIT 1)),
('Agricultural reform', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What is the core theme stated in the title ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.''?' ORDER BY question_id DESC LIMIT 1)),
('Traditional tea culture', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What is the core theme stated in the title ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.''?' ORDER BY question_id DESC LIMIT 1)),
('Mountain pilgrimage', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What is the core theme stated in the title ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Amnesty International', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''Amnesty International / YOKOO, Tadanori (1936 - )'' references which organization?' ORDER BY question_id DESC LIMIT 1)),
('UNESCO', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''Amnesty International / YOKOO, Tadanori (1936 - )'' references which organization?' ORDER BY question_id DESC LIMIT 1)),
('Red Cross', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''Amnesty International / YOKOO, Tadanori (1936 - )'' references which organization?' ORDER BY question_id DESC LIMIT 1)),
('World Health Organization', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''Amnesty International / YOKOO, Tadanori (1936 - )'' references which organization?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('1951', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The work ''THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951'' commemorates which year?' ORDER BY question_id DESC LIMIT 1)),
('1945', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951'' commemorates which year?' ORDER BY question_id DESC LIMIT 1)),
('1964', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951'' commemorates which year?' ORDER BY question_id DESC LIMIT 1)),
('1970', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951'' commemorates which year?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('International Federation of Trade Unions', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Which labor federation is named in ''War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.''?' ORDER BY question_id DESC LIMIT 1)),
('International Labour Organization', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which labor federation is named in ''War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.''?' ORDER BY question_id DESC LIMIT 1)),
('World Federation of Trade Unions', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which labor federation is named in ''War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.''?' ORDER BY question_id DESC LIMIT 1)),
('Confederation of European Trade Unions', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Which labor federation is named in ''War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('London', TRUE, (SELECT question_id FROM questions WHERE question_text = 'In ''Court of Honor, Imperial International Exhibition, London, 1909'', which city is named?' ORDER BY question_id DESC LIMIT 1)),
('Tokyo', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''Court of Honor, Imperial International Exhibition, London, 1909'', which city is named?' ORDER BY question_id DESC LIMIT 1)),
('Paris', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''Court of Honor, Imperial International Exhibition, London, 1909'', which city is named?' ORDER BY question_id DESC LIMIT 1)),
('Berlin', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''Court of Honor, Imperial International Exhibition, London, 1909'', which city is named?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Haneda International Airport', TRUE, (SELECT question_id FROM questions WHERE question_text = 'In ''(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies'', what is the gateway?' ORDER BY question_id DESC LIMIT 1)),
('Tokyo Station', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies'', what is the gateway?' ORDER BY question_id DESC LIMIT 1)),
('Port of Yokohama', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies'', what is the gateway?' ORDER BY question_id DESC LIMIT 1)),
('Narita Cargo Terminal', FALSE, (SELECT question_id FROM questions WHERE question_text = 'In ''(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies'', what is the gateway?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Grand Prize', TRUE, (SELECT question_id FROM questions WHERE question_text = 'What distinction is announced in ''The International Jury of Awards Has Conferred a Grand Prize''?' ORDER BY question_id DESC LIMIT 1)),
('Gold Medal for Sculpture', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What distinction is announced in ''The International Jury of Awards Has Conferred a Grand Prize''?' ORDER BY question_id DESC LIMIT 1)),
('Best Architectural Plan', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What distinction is announced in ''The International Jury of Awards Has Conferred a Grand Prize''?' ORDER BY question_id DESC LIMIT 1)),
('Lifetime Heritage Grant', FALSE, (SELECT question_id FROM questions WHERE question_text = 'What distinction is announced in ''The International Jury of Awards Has Conferred a Grand Prize''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('YOKOO Tadanori', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Who is listed as creator for ''FRANCIS PICABIA 1999-2000 APT INTERNATIO''?' ORDER BY question_id DESC LIMIT 1)),
('YASUDA Haruhiko', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is listed as creator for ''FRANCIS PICABIA 1999-2000 APT INTERNATIO''?' ORDER BY question_id DESC LIMIT 1)),
('INA Eiji', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is listed as creator for ''FRANCIS PICABIA 1999-2000 APT INTERNATIO''?' ORDER BY question_id DESC LIMIT 1)),
('AKASEGAWA Gempei', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is listed as creator for ''FRANCIS PICABIA 1999-2000 APT INTERNATIO''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Ina Eiji', TRUE, (SELECT question_id FROM questions WHERE question_text = 'Who is the creator of ''Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )''?' ORDER BY question_id DESC LIMIT 1)),
('Yokoo Tadanori', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is the creator of ''Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )''?' ORDER BY question_id DESC LIMIT 1)),
('Unknown Artist', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is the creator of ''Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )''?' ORDER BY question_id DESC LIMIT 1)),
('Hayakawa Yoshio', FALSE, (SELECT question_id FROM questions WHERE question_text = 'Who is the creator of ''Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )''?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Minato-ku', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shinbashi, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Chiyoda-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shinbashi, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Shibuya-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shinbashi, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Setagaya-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shinbashi, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('Minato-ku', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shibaura, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Bunkyo-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shibaura, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Sumida-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shibaura, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1)),
('Koto-ku', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The title ''Shibaura, Minato-ku from In Tokyo'' identifies which ward?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('20世紀', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.'' is cataloged under which time period?' ORDER BY question_id DESC LIMIT 1)),
('1969', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.'' is cataloged under which time period?' ORDER BY question_id DESC LIMIT 1)),
('1999', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.'' is cataloged under which time period?' ORDER BY question_id DESC LIMIT 1)),
('[1910]', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The poster ''JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.'' is cataloged under which time period?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('1976', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The Amnesty International work by YOKOO Tadanori is from which year?' ORDER BY question_id DESC LIMIT 1)),
('1951', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The Amnesty International work by YOKOO Tadanori is from which year?' ORDER BY question_id DESC LIMIT 1)),
('1984', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The Amnesty International work by YOKOO Tadanori is from which year?' ORDER BY question_id DESC LIMIT 1)),
('1964', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The Amnesty International work by YOKOO Tadanori is from which year?' ORDER BY question_id DESC LIMIT 1));

INSERT INTO options (option_text, is_correct, question_id)
VALUES
('[1910]', TRUE, (SELECT question_id FROM questions WHERE question_text = 'The work ''Court of Honor, Imperial International Exhibition, London, 1909'' is recorded with which bracketed year?' ORDER BY question_id DESC LIMIT 1)),
('[1967]', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''Court of Honor, Imperial International Exhibition, London, 1909'' is recorded with which bracketed year?' ORDER BY question_id DESC LIMIT 1)),
('1909', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''Court of Honor, Imperial International Exhibition, London, 1909'' is recorded with which bracketed year?' ORDER BY question_id DESC LIMIT 1)),
('1969', FALSE, (SELECT question_id FROM questions WHERE question_text = 'The work ''Court of Honor, Imperial International Exhibition, London, 1909'' is recorded with which bracketed year?' ORDER BY question_id DESC LIMIT 1));
