-- Volltextsuche für Rezepte. Wird von der Service-Schicht beim Speichern gepflegt.
CREATE VIRTUAL TABLE `recipe_search` USING fts5(
  `recipe_id` UNINDEXED,
  `user_id` UNINDEXED,
  `title`,
  `body`,
  tokenize = 'unicode61 remove_diacritics 2'
);
