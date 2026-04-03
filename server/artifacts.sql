INSERT INTO artifacts (
  artifact_name,
  description,
  creator,
  time_period,
  picture_url,
  acquisition_date,
  origin,
  museum_id,
  category_id
)
VALUES
  ('National Museum-Ante Spatti Etatem II / YASUDA, Haruhiko (1930 - 2018)', 'An authentic artifact from Japan.', LEFT('保田春彦 (1930 - 2018)', 50), '1969', 'https://search.artmuseums.go.jp/jpeg/small/momat/S0117080.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('(New Famous Views of Tokyo) Haneda International Airport Viewed from an Airplane', 'An authentic artifact from Japan.', 'Unknown Artist', '20世紀', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/514235-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('View of Hakone, Fuji Hakone National Park', 'An authentic artifact from Japan.', 'Unknown Artist', '1964', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/492404-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('JAPAN THE FOCUS OF INTERNATIONAL COMMUNICATIONS.', 'An authentic artifact from Japan.', 'Unknown Artist', '20世紀', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/510159-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('Amnesty International / YOKOO, Tadanori (1936 - )', 'An authentic artifact from Japan.', LEFT('横尾忠則 (1936 - )', 50), '1976', 'https://search.artmuseums.go.jp/jpeg/small/momak/ot0089-044.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('THE 6TH NATIONAL ATHLETIC MEETING COMMEMORATION OF HIROSHIMA 1951', 'An authentic artifact from Japan.', 'Unknown Artist', '1951', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/503832-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('War against War! INTERNATIONAL FEDERATION OF TRADE UNIONS AMSTERDAM.', 'An authentic artifact from Japan.', 'Unknown Artist', '20世紀', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/504455-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('The 5th International Biennial Exhibition of Prints in Tokyo 1966 (The National Museum of Modern Art) / HAYAKAWA, Yoshio (1917 - 2009)', 'An authentic artifact from Japan.', LEFT('早川良雄 (1917 - 2009)', 50), '1966', NULL, '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('Court of Honor, Imperial International Exhibition, London, 1909', 'An authentic artifact from Japan.', 'Unknown Artist', '[1910]', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/512865-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('(Great Tokyo) Haneda International Airport, Imperial Capital''s Gateway to the Skies', 'An authentic artifact from Japan.', 'Unknown Artist', '20世紀', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/514236-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('The International Jury of Awards Has Conferred a Grand Prize', 'An authentic artifact from Japan.', 'Unknown Artist', '[1967]', 'https://museumcollection.tokyo/wp-content/uploads/2025/07/503853-L.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('FRANCIS PICABIA 1999-2000 APT INTERNATIO', 'An authentic artifact from Japan.', 'YOKOO Tadanori', '1999', 'https://museumcollection.tokyo/wp-content/uploads/2023/11/24520.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('The 2nd Anti-Imperialism International Conference Tokyo (Anti-Imperialism International Conference Executive Committee) / AKASEGAWA, Gempei (1937 - 2014)', 'An authentic artifact from Japan.', LEFT('赤瀬川原平 (1937 - 2014)', 50), '1969', NULL, '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('Mita, Minato-ku from In Tokyo / INA, Eiji (1957 - )', 'An authentic artifact from Japan.', LEFT('伊奈英次 (1957 - )', 50), '1983', 'https://search.artmuseums.go.jp/jpeg/small/momat/s0190117.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('Shinbashi, Minato-ku from In Tokyo / INA, Eiji (1957 - )', 'An authentic artifact from Japan.', LEFT('伊奈英次 (1957 - )', 50), '1984', 'https://search.artmuseums.go.jp/jpeg/small/momat/s0191009.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1)),
  ('Shibaura, Minato-ku from In Tokyo / INA, Eiji (1957 - )', 'An authentic artifact from Japan.', LEFT('伊奈英次 (1957 - )', 50), '1983', 'https://search.artmuseums.go.jp/jpeg/small/momat/s0191001.jpg', '2026-02-22', 'Japan', 3, (SELECT category_id FROM categories WHERE LOWER(category_name) = 'art' LIMIT 1));
