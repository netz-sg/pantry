# Setup nach i18n Entfernung

## Wichtige Schritte nach der Umstellung:

### 1. Development Server neu starten

Die `.env.local` Datei wurde aktualisiert - der Server muss neu gestartet werden:

```bash
# Server stoppen (Ctrl+C im Terminal)
# Dann neu starten:
npm run dev
```

### 2. Browser-Cookies löschen

Die alten JWT-Tokens wurden mit `NEXTAUTH_SECRET` verschlüsselt, jetzt verwenden wir `AUTH_SECRET`.

**Wichtig**: Lösche alle Cookies für `localhost:3000` in deinem Browser:

- **Chrome/Edge**: F12 → Application → Cookies → localhost:3000 → Alle löschen
- **Firefox**: F12 → Storage → Cookies → localhost:3000 → Alle löschen

### 3. Neu registrieren/anmelden

Nach dem Löschen der Cookies kannst du:
- Ein neues Konto erstellen unter `/signup`
- Oder dich mit einem bestehenden Konto anmelden unter `/signin`

## Änderungen

✅ Alle `/auth/` Routen entfernt → jetzt `/signin` und `/signup`  
✅ `locale` Parameter komplett entfernt  
✅ `next-intl` Abhängigkeiten aus Komponenten entfernt  
✅ AUTH_SECRET für NextAuth v5 konfiguriert  
✅ Hardcoded deutsche Labels in der Navigation
