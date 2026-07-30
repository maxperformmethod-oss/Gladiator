# Vrstva 2 — serverová logika

Sem patrí business logika a autorizácia klubovej/administračnej časti — nie prezentácia. Každý súbor v tomto priečinku bude začínať `import 'server-only'`, aby sa nikdy nedostal do klientského bundlu. Komponenty sem nikdy neimportujú Prismu priamo — prístup k databáze ide výhradne cez funkcie tejto vrstvy.
