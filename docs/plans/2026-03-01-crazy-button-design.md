# Crazy Button — Design Document

## Concept

Een groepschat-app waar je niet kunt typen. Iedereen heeft een persoonlijke knop die een willekeurig grappig/gek bericht stuurt naar de hele groep. Berichten krijgen likes en er is een scorebord.

## Doelgroep

Iedereen — families en vrienden, alle leeftijden.

## Kernfeatures

### Groepen
- Groepen van elke grootte
- Per groep instelbaar: anoniem of met naam
- Uitnodigen via deelbare link/code of QR-code
- Groepsnaam kiezen bij aanmaken

### De Knop
- Persoonlijk aanpasbaar: kleur, vorm, patroon
- Vormen: rond, vierkant, ster, hart, etc.
- Pulseert als "druk op mij!" animatie
- Beperkt aantal drukken per dag (bv. 10)
- Teller toont resterend aantal drukken

### Druk-ervaring
1. Telefoon trilt (haptische feedback)
2. Confetti-explosie over het hele scherm
3. Bubbel verschijnt met het willekeurige bericht
4. Bubbel vliegt omhoog naar de chat
5. Bericht wordt realtime naar alle groepsleden gestuurd

### Berichten-systeem
Willekeurige selectie uit categorien:
- **Grappige zinnetjes** — "Ik heb net een eenhoorn gezien op de fiets"
- **Emoji-combinaties** — willekeurige emoji-reeksen
- **Geluidjes** — raar geluid dat afspeelt bij de ontvanger
- **Gifjes** — willekeurig gekozen grappig gifje

Elke druk kiest random uit alle categorien.

### Reacties & Scorebord
- Like-systeem (hartje) op berichten
- Scorebord: top berichten met meeste likes deze week
- "Crazy Crown" voor degene met de meeste likes

### Meldingen
- Push-notificaties instelbaar per gebruiker
- Kan aan/uit gezet worden

## Schermen

### 1. Groepen-overzicht (startscherm)
- Lijst van groepen met naam en preview van laatste bericht
- Badge met aantal nieuwe berichten per groep
- "+" knop om nieuwe groep te maken

### 2. Groepsscherm
- **Bovenaan:** feed met gekke berichten, nieuwste eerst
- Elk bericht toont: bericht + afzender (of "???" bij anoniem) + likes
- Tik op hartje om te liken
- **Onderaan:** persoonlijke Crazy Button + druk-teller

### 3. Scorebord
- Tab of swipe binnen groepsscherm
- Top berichten van de week
- Crazy Crown indicator

### 4. Groep aanmaken
- Naam invoeren
- Anoniem toggle
- Deel via link/code of QR-code

### 5. Knop personaliseren
- Kleur picker
- Vorm selectie
- Patroon keuze

## Stijl & Kleuren

- **Achtergrond:** donker met gekleurde patronen die langzaam bewegen (wervelingen, stippen, strepen)
- **Berichten:** kleurrijke bubbels, elke keer een andere kleur
- **De knop:** groot, gekleurd met pulserende animatie
- **Lettertype:** speels en rond, goed leesbaar
- **Vibe:** gekke energie, alsof de app zelf een beetje gek is
- **Algeheel:** alle kleuren in gekke patronen

## Technische Architectuur

```
+-------------------------+
|   Expo / React Native   |
|   (iOS + Android app)   |
+-----------+-------------+
            | REST + Realtime
+-----------v-------------+
|       Supabase          |
|  - Auth (anoniem/email) |
|  - Database (Postgres)  |
|  - Realtime subscripts  |
|  - Edge Functions       |
|  - Storage (gifjes)     |
+-------------------------+
```

### Tech Stack
- **Frontend:** React Native + Expo
- **Backend:** Supabase (gratis tier)
  - Auth: anoniem + optioneel e-mail
  - Database: Postgres voor groepen, berichten, likes
  - Realtime: WebSocket subscriptions voor live berichten
  - Storage: voor gifjes
- **Push-notificaties:** Expo Notifications
- **Animaties:** React Native Reanimated + Lottie voor confetti
- **Dagelijkse limiet:** server-side enforcement via Supabase RLS

### Database Schema (conceptueel)

- **users:** id, display_name, created_at
- **groups:** id, name, is_anonymous, invite_code, created_by, created_at
- **group_members:** group_id, user_id, button_style, daily_presses, joined_at
- **messages:** id, group_id, sender_id, content_type, content, created_at
- **likes:** message_id, user_id, created_at

### Beperkingen
- Dagelijks druk-limiet: server-side via RLS policy + daily reset
- Groepsgrootte: geen harde limiet, Supabase free tier accommodeert dit
- Berichtopslag: berichten ouder dan 30 dagen kunnen verwijderd worden om storage te besparen
