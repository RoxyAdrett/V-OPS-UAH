# Configuración de Firebase

1. Crea un proyecto en Firebase Console y añade una aplicación Web.
2. Activa **Authentication > Email/Password**, **Cloud Firestore** y **Storage**.
3. Copia la configuración Web en `src/environments/firebase.config.ts`.
4. Crea las dos cuentas desde **Authentication > Users**: una de jugador y una de coach.
5. En Firestore crea un documento para cada cuenta en `users/<UID>`:

```json
{ "teamId": "team-valorant-1", "role": "coach", "name": "Coach Valoplant" }
```

Para el jugador, cambia `role` a `player`. Ambos perfiles deben tener el mismo `teamId` para compartir Horario y Notas.

6. Publica las reglas de `firestore.rules` y `storage.rules` desde Firebase Console o Firebase CLI.

Los datos quedan bajo estas rutas:

- `teams/{teamId}/scheduleEvents/{eventId}`
- `teams/{teamId}/coachNotes/{noteId}`
- `teams/{teamId}/coach-notes/{archivo}` en Storage.

La sesión persiste con Firebase en el dispositivo. El correo se prellena desde la app; el navegador maneja la contraseña con su autocompletado seguro, sin guardarla en texto plano.
