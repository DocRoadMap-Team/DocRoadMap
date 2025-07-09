# 📱 DocRoadMap Mobile – User Documentation

---

## 1. Introduction

**DocRoadMap** est une application mobile qui accompagne les utilisateurs dans toutes leurs démarches administratives en leur proposant des parcours personnalisés, étape par étape. Elle vient compléter l’extension web pour offrir une expérience fluide, accessible et interactive sur mobile.

### Fonctionnalités principales :

- Génération automatique de procédures personnalisées via **un arbre décisionnel intelligent**.
- Navigation visuelle et interactive entre les étapes.
- Deux chatbots intégrés :
  - Un pour répondre à vos **questions administratives**.
  - Un pour **modifier vos démarches** existantes.
- Intégration avec le **calendrier interne du téléphone**.
- Rappels et notifications intelligents.
- Support multi-langues.
- Accessibilité conforme aux standards **WCAG** et **RGAA**.
- Possibilité de thème sombre ou clair

---

## 2. Premiers pas

### 1. Télécharger & installer

- Disponible via une **APK** téléchargez et installez l’application.

### 2. Créer un compte / Se connecter

1. Lancez l’app, puis sélectionnez **Créer un compte** ou **Se connecter**.
2. Saisissez votre adresse e-mail et un mot de passe sécurisé.
3. Vous recevrez un e-mail de vérification.
4. Une fois validé, vous accédez à votre tableau de bord.

---

## 3. Fonctionnalités principales

### 🧾 Créer une procédure via un arbre décisionnel

Le cœur de l’expérience DocRoadMap repose sur un **arbre décisionnel interactif** qui vous guide pour générer automatiquement une procédure adaptée à votre situation :

1. Appuyez sur **Générer une démarche administrative** depuis l’écran d’accueil.
2. Répondez à une série de questions à choix multiples (ex. : _“Tu viens d’emménager ?”_, _“Tu es étudiant ?”_).
3. L’app utilise vos réponses pour générer une **roadmap personnalisée** avec les étapes précises à suivre.
4. Cette démarche s’ajoute automatiquement dans votre section **Mes procédures**.

#### Chaque étape comporte :

- Un **titre** et une **description**.
- Des **ressources associées** (liens, documents, aides).
- Une **option pour ajouter au calendrier** avec notification.

---

### 📚 Navigation dans les démarches

- Les démarches sont affichées sous forme de **cartes** dans un carrousel.
- **Swipez** pour parcourir vos différentes procédures.
- Cliquez sur une carte pour voir la **liste des étapes**.
- Chaque étape est cliquable pour :
  - Obtenir des **détails complets**.
  - Ajouter une étape ** dans votre calendrier**.
  - Activer ou non une **notification**.
  - Activer ou non une **barre de progression**

---

### 📅 Calendrier intelligent intégré

- Connecté au **calendrier interne du téléphone** via `expo-calendar`.
- En sélectionnant une date, vous visualisez les **choses à faire ce jour-là** (issues de vos démarches).
- Depuis une étape, vous pouvez :
  - Choisir une **date et une heure** avec un **sélecteur**.
  - Ajouter une **notification facultative**.
  - Gérer tous vos rappels depuis une **vue calendrier** claire et intuitive.

---

### 🤖 Chatbots intégrés

- **Chatbot d’assistance administrative** (accessible en haut à droite entre le titre de l'application et les paramètres) :  
  Posez vos questions sur n’importe quelle démarche administrative.
- **Chatbot de modification de procédure** :  
  Disponible depuis l’écran d’une procédure, il vous aide à **ajuster** votre roadmap si votre situation évolue ou que la génération ne vous satisfait pas.

---

### ♿ Accessibilité

L’application est conçue pour répondre aux exigences d’**accessibilité numérique** et est accesibile via le bouton **paramètres** en forme d'engrenage touten haut à droite :

- **Compatibilité TalkBack** (Android).
- **Taille de texte adaptable** selon les préférences système.
- **Contraste renforcé**, **mode sombre/clair**, navigation fluide.
- Composants UI accessibles, **labels explicites**, **rôles définis**, et **allowFontScaling** activé.

---

## 4. Dépannage

- **Connexion impossible** : Vérifiez vos identifiants ou prévenez un membre de développement via le discord bêta ou instagram.
- **L’application plante** : Fermez puis relancez l’app ou redémarrez votre téléphone.
- **Rappels non reçus** : Vérifiez les permissions calendrier/notifications dans les paramètres de votre téléphone.

---

## 5. Conclusion

**DocRoadMap Mobile** est votre assistant personnel pour simplifier la gestion administrative. Grâce à son **arbre décisionnel**, ses **deux chatbots complémentaires**, son **calendrier intelligent** et son interface **accessible**, vous êtes guidé·e pas à pas, sans stress ni oubli.

Vous savez désormais **quoi faire, quand, et comment**.  
Bienvenue dans l’administration simplifiée.
