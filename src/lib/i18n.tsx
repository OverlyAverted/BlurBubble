import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'fr' | 'de';

export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch'
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // App Header
    'app.title': 'BlurBubble',
    'app.subtitle': 'Stop Recording Me - Personal Privacy Shield for Smart Devices',
    'app.version': 'Privacy Shield v1',
    'nav.home': 'HOME',
    'nav.screen': 'Screen',
    'nav.selectView': 'Select view...',

    // View categories
    'cat.beacon': 'My Privacy',
    'cat.glasses': 'Test Camera',
    'cat.audit': 'Official Proof',
    'cat.tech': 'Help',

    // View Options
    'view.glasses.scanner': 'Local Devices Finder',
    'view.glasses.webcam': 'Your Live Camera View',
    'view.glasses.heatmap': 'Privacy Map & Heat',
    'view.glasses.street': 'Virtual Walk Sandbox',
    'view.audit.main': 'Live Shield Safe-Check',
    'view.tech.pitch': 'App Future Plans & Ideas',
    'view.tech.timeline': 'How We Keep You Safe',
    'view.tech.hardware': 'Connected Gear & Tags',
    'view.tech.sdk_code': 'Computer Code Behind It',
    'view.tech.crypto': 'Web Crypto Shield Vault',
    'view.citizen.settings': 'Alerts & Sound Settings',
    'view.citizen.biometric': 'Lock My App',
    'view.citizen.retention': 'Clean Out My History',
    'view.citizen.perimeter': 'Safe School Zones',
    'view.citizen.escrow': 'Warrant Overrides',
    'view.citizen.licensing': 'Safety Badges & Checks',
    'view.citizen.faces': 'My Blurred Faces',
    'view.citizen.scrub': 'Request Blur Online',
    'view.citizen.overview': 'Main Dashboard',
    'view.citizen.pairing': 'Pair My Badge',
    'view.citizen.hierarchy': 'What Rule Wins?',
    'view.citizen.legal': 'Safety Quiz',
    'view.citizen.tags': 'Protected Toys & Bags',
    'view.citizen.signal': 'Shield Broadcast Range',
    'view.citizen.wifi': 'Home WiFi Rules',
    'view.citizen.experimental': 'Experimental Tech',

    // Descs
    'desc.glasses.scanner': 'Scan for nearby active signals and tracking gear',
    'desc.glasses.webcam': 'See how your screen blurs faces in real-time',
    'desc.glasses.heatmap': 'See where cameras are around you',
    'desc.glasses.street': 'See how glasses automatically blur street bystanders',
    'desc.audit.main': 'Check if your shield is working and officially safe',
    'desc.tech.pitch': 'Simple guide to our goals, ideas, and dreams',
    'desc.tech.timeline': 'A timeline of how we protect you step-by-step',
    'desc.tech.hardware': 'Check on your badges and battery levels',
    'desc.tech.sdk_code': 'Super simple look at the code that does the magic',
    'desc.tech.crypto': 'Inspect real-time browser ECDSA public keys and active signatures',
    'desc.citizen.settings': 'Change sounds, pocket buzz alerts, and notifications',
    'desc.citizen.biometric': 'Use your finger scan or code to keep others out',
    'desc.citizen.retention': 'Decide when the app automatically wipes old records',
    'desc.citizen.perimeter': 'Pick safe places on a map where recording is blocked',
    'desc.citizen.escrow': 'See keys that can turn off the shield in emergency cases',
    'desc.citizen.licensing': 'Official certificates showing our safety lab tests',
    'desc.citizen.faces': 'Add photos of your face so smart cameras blur them',
    'desc.citizen.scrub': 'Request to blur your face on public video databases',
    'desc.citizen.overview': 'Your general status, signal charts, and widget layout',
    'desc.citizen.pairing': 'Link physical keychains or pocket buttons',
    'desc.citizen.hierarchy': 'Sort your safety rules so the app knows which to follow first',
    'desc.citizen.legal': 'A fun quick test to learn how privacy laws protect you',
    'desc.citizen.tags': 'Add virtual tags to blur items like backpacks',
    'desc.citizen.signal': 'Pick how far your Stop Recording signal can reach',
    'desc.citizen.wifi': 'Turn shield on/off automatically when you join home WiFi',
    'desc.citizen.experimental': 'Test and simulate speculative next-gen privacy countermeasures',

    // Dashboard General Text
    'dash.shieldActive': 'SHIELD BROADCAST ACTIVE',
    'dash.shieldInactive': 'SHIELD BROADCAST INACTIVE',
    'dash.totalLockdown': 'TOTAL LOCKDOWN ENGAGED',
    'dash.entities': 'REGISTERED ENTITIES',
    'dash.battery': 'BATTERY',
    'dash.devicePaired': 'DEVICE PAIRED',
    'dash.noDevice': 'NO DEVICE PAIRED',
    'dash.help': 'HELP & GUIDES',
    'dash.lock': 'LOCK APP',
    'dash.unlock': 'UNLOCK APP',
    'dash.overview': 'Overview',
    'dash.logs': 'Live Activity Stream',
    'dash.activeShield': 'Active Privacy Shield',
    'dash.status': 'Status',
    'dash.range': 'Signal Range',
    'dash.meters': 'meters',
    'dash.powerLevel': 'Transmission Power',
    'dash.registered': 'Registered Tags',
    'dash.recentDetections': 'Recent Camera Detections',
    'dash.noiseStatus': 'Interference Level',

    // Audit Report
    'audit.builderTitle': 'Report Builder',
    'audit.builderDesc': 'Generate a security-compliant digital evidence report',
    'audit.metricsTitle': 'Compliance Metrics',
    'audit.metricsDesc': 'Targeted face-blur success rates across major CDNs',
    'audit.typeNamePlaceholder': 'Type name (e.g. Agent 42A)',
    'audit.signInstruction': 'Sign on line with mouse or fingertip',
    'audit.clearSignature': 'Clear Signature',
    'audit.simulateIncident': 'Simulate Incident',

    // Global
    'global.save': 'Save Changes',
    'global.cancel': 'Cancel',
    'global.enabled': 'Enabled',
    'global.disabled': 'Disabled',
    'global.loading': 'Loading...',
    'global.active': 'Active',
    'global.inactive': 'Inactive'
  },
  fr: {
    // App Header
    'app.title': 'BlurBubble',
    'app.subtitle': 'Arrêtez de m\'enregistrer - Bouclier de confidentialité personnel pour appareils intelligents',
    'app.version': 'Bouclier de Confidentialité v1',
    'nav.home': 'ACCUEIL',
    'nav.screen': 'Écran',
    'nav.selectView': 'Sélectionner la vue...',

    // View categories
    'cat.beacon': 'Ma Confidentialité',
    'cat.glasses': 'Tester la Caméra',
    'cat.audit': 'Preuve Officielle',
    'cat.tech': 'Aide',

    // View Options
    'view.glasses.scanner': 'Recherche d\'Appareils Locaux',
    'view.glasses.webcam': 'Votre Caméra en Direct',
    'view.glasses.heatmap': 'Carte de Confidentialité & Chaleur',
    'view.glasses.street': 'Simulation de Promenade Virtuelle',
    'view.audit.main': 'Contrôle de Sécurité du Bouclier',
    'view.tech.pitch': 'Plans Futurs de l\'Application',
    'view.tech.timeline': 'Comment Nous Vous Protégeons',
    'view.tech.hardware': 'Équipements & Badges Connectés',
    'view.tech.sdk_code': 'Code Informatique Sous-jacent',
    'view.tech.crypto': 'Coffre Cryptographique Web',
    'view.citizen.settings': 'Alertes & Paramètres Sonores',
    'view.citizen.biometric': 'Verrouiller Mon Application',
    'view.citizen.retention': 'Nettoyer Mon Historique',
    'view.citizen.perimeter': 'Zones Scolaires Sécurisées',
    'view.citizen.escrow': 'Dérogations aux Mandats',
    'view.citizen.licensing': 'Badges & Contrôles de Sécurité',
    'view.citizen.faces': 'Mes Visages Floutés',
    'view.citizen.scrub': 'Demande de Floutage en Ligne',
    'view.citizen.overview': 'Tableau de Bord Principal',
    'view.citizen.pairing': 'Associer Mon Badge',
    'view.citizen.hierarchy': 'Quelle Règle l\'Emporte?',
    'view.citizen.legal': 'Quiz sur la Sécurité',
    'view.citizen.tags': 'Jouets & Sacs Protégés',
    'view.citizen.signal': 'Portée d\'Émission du Bouclier',
    'view.citizen.wifi': 'Règles WiFi Domestiques',
    'view.citizen.experimental': 'Tech Expérimentale',

    // Descs
    'desc.glasses.scanner': 'Rechercher des signaux actifs et des équipements de suivi à proximité',
    'desc.glasses.webcam': 'Voyez comment votre écran floute les visages en temps réel',
    'desc.glasses.heatmap': 'Voyez où se trouvent les caméras autour de vous',
    'desc.glasses.street': 'Voyez comment les lunettes floutent automatiquement les passants',
    'desc.audit.main': 'Vérifiez si votre bouclier fonctionne et est officiellement sûr',
    'desc.tech.pitch': 'Guide simple de nos objectifs, idées et rêves',
    'desc.tech.timeline': 'Une chronologie de la façon dont nous vous protégeons étape par étape',
    'desc.tech.hardware': 'Vérifiez vos badges et les niveaux de batterie',
    'desc.tech.sdk_code': 'Aperçu ultra simple du code qui fait la magie',
    'desc.tech.crypto': 'Inspecter les clés publiques ECDSA et les signatures actives en temps réel',
    'desc.citizen.settings': 'Modifier les sons, les alertes vibrantes et les notifications',
    'desc.citizen.biometric': 'Utilisez votre empreinte ou un code pour restreindre l\'accès',
    'desc.citizen.retention': 'Décidez quand l\'application efface automatiquement l\'historique',
    'desc.citizen.perimeter': 'Choisissez des lieux sûrs sur une carte où l\'enregistrement est bloqué',
    'desc.citizen.escrow': 'Voir les clés permettant de désactiver le bouclier en cas d\'urgence',
    'desc.citizen.licensing': 'Certificats officiels de nos tests en laboratoire de sécurité',
    'desc.citizen.faces': 'Ajoutez des photos de votre visage pour que les caméras les floutent',
    'desc.citizen.scrub': 'Demander le floutage de votre visage sur les bases de données vidéo publiques',
    'desc.citizen.overview': 'Votre statut général, vos graphiques de signaux et vos widgets',
    'desc.citizen.pairing': 'Associez des porte-clés physiques ou des boutons de poche',
    'desc.citizen.hierarchy': 'Triez vos règles de sécurité pour définir les priorités d\'application',
    'desc.citizen.legal': 'Un test rapide et ludique pour apprendre à protéger vos droits',
    'desc.citizen.tags': 'Ajoutez des balises virtuelles pour flouter des objets comme les sacs',
    'desc.citizen.signal': 'Choisissez la portée de votre signal d\'arrêt d\'enregistrement',
    'desc.citizen.wifi': 'Activez/désactivez le bouclier automatiquement en rejoignant votre WiFi',
    'desc.citizen.experimental': 'Tester et simuler des contre-mesures de confidentialité spéculatives de nouvelle génération',

    // Dashboard General Text
    'dash.shieldActive': 'DIFFUSION DU BOUCLIER ACTIVE',
    'dash.shieldInactive': 'DIFFUSION DU BOUCLIER INACTIVE',
    'dash.totalLockdown': 'VERROUILLAGE TOTAL ACTIVÉ',
    'dash.entities': 'ENTITÉS ENREGISTRÉES',
    'dash.battery': 'BATTERIE',
    'dash.devicePaired': 'APPAREIL ASSOCIÉ',
    'dash.noDevice': 'AUCUN APPAREIL ASSOCIÉ',
    'dash.help': 'AIDE & GUIDES',
    'dash.lock': 'VERROUILLER L\'APP',
    'dash.unlock': 'DÉVERROUILLER L\'APP',
    'dash.overview': 'Aperçu',
    'dash.logs': 'Flux d\'Activité en Direct',
    'dash.activeShield': 'Bouclier de Confidentialité Actif',
    'dash.status': 'Statut',
    'dash.range': 'Portée du Signal',
    'dash.meters': 'mètres',
    'dash.powerLevel': 'Puissance de Transmission',
    'dash.registered': 'Balises Enregistrées',
    'dash.recentDetections': 'Détections de Caméra Récentes',
    'dash.noiseStatus': 'Niveau de Brouillage',

    // Audit Report
    'audit.builderTitle': 'Générateur de rapports',
    'audit.builderDesc': 'Générer un rapport de preuve numérique conforme à la sécurité',
    'audit.metricsTitle': 'Mesures de conformité',
    'audit.metricsDesc': 'Taux de réussite du floutage de visages sur les principaux CDN',
    'audit.typeNamePlaceholder': 'Entrez le nom (ex: Agent 42A)',
    'audit.signInstruction': 'Signez sur la ligne avec votre souris ou doigt',
    'audit.clearSignature': 'Effacer la signature',
    'audit.simulateIncident': 'Simuler un incident',

    // Global
    'global.save': 'Enregistrer',
    'global.cancel': 'Annuler',
    'global.enabled': 'Activé',
    'global.disabled': 'Désactivé',
    'global.loading': 'Chargement...',
    'global.active': 'Actif',
    'global.inactive': 'Inactif'
  },
  de: {
    // App Header
    'app.title': 'BlurBubble',
    'app.subtitle': 'Hören Sie auf, mich aufzunehmen - Persönlicher Datenschutzschild für intelligente Geräte',
    'app.version': 'Datenschutzschild v1',
    'nav.home': 'STARTSEITE',
    'nav.screen': 'Bildschirm',
    'nav.selectView': 'Ansicht auswählen...',

    // View categories
    'cat.beacon': 'Meine Privatsphäre',
    'cat.glasses': 'Kamera testen',
    'cat.audit': 'Offizieller Nachweis',
    'cat.tech': 'Hilfe',

    // View Options
    'view.glasses.scanner': 'Gerätefinder vor Ort',
    'view.glasses.webcam': 'Ihre Live-Kamera-Ansicht',
    'view.glasses.heatmap': 'Datenschutz- & Wärmekarte',
    'view.glasses.street': 'Virtueller Spaziergang',
    'view.audit.main': 'Sicherheitsprüfung Schild',
    'view.tech.pitch': 'Zukunftspläne der App',
    'view.tech.timeline': 'Wie wir Sie schützen',
    'view.tech.hardware': 'Verbundene Geräte & Badges',
    'view.tech.sdk_code': 'Der Programmcode dahinter',
    'view.tech.crypto': 'Web-Krypto-Schildtresor',
    'view.citizen.settings': 'Warnungen & Töne',
    'view.citizen.biometric': 'App sperren',
    'view.citizen.retention': 'Verlauf bereinigen',
    'view.citizen.perimeter': 'Sichere Schulzonen',
    'view.citizen.escrow': 'Behörden-Overrides',
    'view.citizen.licensing': 'Sicherheitsplaketten',
    'view.citizen.faces': 'Meine verpixelten Gesichter',
    'view.citizen.scrub': 'Verpixelung anfordern',
    'view.citizen.overview': 'Haupt-Dashboard',
    'view.citizen.pairing': 'Badge koppeln',
    'view.citizen.hierarchy': 'Regel-Rangordnung',
    'view.citizen.legal': 'Sicherheits-Quiz',
    'view.citizen.tags': 'Geschützte Spielzeuge & Taschen',
    'view.citizen.signal': 'Schild-Sendereichweite',
    'view.citizen.wifi': 'Heim-WLAN-Regeln',
    'view.citizen.experimental': 'Experimentelle Tech',

    // Descs
    'desc.glasses.scanner': 'Nach aktiven Signalen und Tracking-Geräten in der Nähe suchen',
    'desc.glasses.webcam': 'Sehen Sie, wie Ihr Bildschirm Gesichter in Echtzeit verpixeln',
    'desc.glasses.heatmap': 'Sehen Sie, wo sich Kameras in Ihrer Nähe befinden',
    'desc.glasses.street': 'Sehen Sie, wie Brillen Passanten auf der Straße automatisch verpixeln',
    'desc.audit.main': 'Prüfen Sie, ob Ihr Schild funktioniert und offiziell sicher ist',
    'desc.tech.pitch': 'Einfacher Leitfaden zu unseren Zielen, Ideen und Träumen',
    'desc.tech.timeline': 'Eine Chronologie, wie wir Sie Schritt für Schritt schützen',
    'desc.tech.hardware': 'Überprüfen Sie Ihre Badges und Batteriestände',
    'desc.tech.sdk_code': 'Super einfacher Blick auf den Code, der die Magie bewirkt',
    'desc.tech.crypto': 'Überprüfen Sie aktive ECDSA-Schlüssel und Signaturen in Echtzeit',
    'desc.citizen.settings': 'Töne, Vibrationsalarme und Benachrichtigungen ändern',
    'desc.citizen.biometric': 'Nutzen Sie Ihren Fingerabdruck oder Code, um unbefugten Zugriff zu verhindern',
    'desc.citizen.retention': 'Entscheiden Sie, wann die App alten Verlauf automatisch löscht',
    'desc.citizen.perimeter': 'Wählen Sie sichere Orte auf der Karte, an denen Aufnahmen blockiert sind',
    'desc.citizen.escrow': 'Sehen Sie Schlüssel ein, die das Schild im Notfall deaktivieren können',
    'desc.citizen.licensing': 'Offizielle Zertifikate unserer Sicherheitslabortests',
    'desc.citizen.faces': 'Fügen Sie Fotos Ihres Gesichts hinzu, damit Kameras sie verpixeln',
    'desc.citizen.scrub': 'Beantragen Sie die Verpixelung Ihres Gesichts in öffentlichen Videodatenbanken',
    'desc.citizen.overview': 'Ihr allgemeiner Status, Signaldiagramme und Widget-Layout',
    'desc.citizen.pairing': 'Verbinden Sie physische Schlüsselanhänger oder Taschentasten',
    'desc.citizen.hierarchy': 'Ordnen Sie Ihre Sicherheitsregeln nach Priorität',
    'desc.citizen.legal': 'Ein spielerischer Schnelltest, um Ihre Rechte kennenzulernen',
    'desc.citizen.tags': 'Fügen Sie virtuelle Tags hinzu, um Gegenstände wie Rucksäcke zu verpixeln',
    'desc.citizen.signal': 'Wählen Sie die Reichweite Ihres Stopp-Aufnahme-Signals',
    'desc.citizen.wifi': 'Schild automatisch ein-/ausschalten, wenn Sie sich im Heim-WLAN anmelden',
    'desc.citizen.experimental': 'Testen und simulieren Sie spekulative Datenschutz-Gegenmaßnahmen der nächsten Generation',

    // Dashboard General Text
    'dash.shieldActive': 'SCHILD-ÜBERTRAGUNG AKTIV',
    'dash.shieldInactive': 'SCHILD-ÜBERTRAGUNG INAKTIV',
    'dash.totalLockdown': 'VOLLSTÄNDIGE SPERRE AKTIVIERT',
    'dash.entities': 'REGISTRIERTE ELEMENTE',
    'dash.battery': 'BATTERIE',
    'dash.devicePaired': 'GERÄT GEKOPPELT',
    'dash.noDevice': 'KEIN GERÄT GEKOPPELT',
    'dash.help': 'HILFE & LEITFÄDEN',
    'dash.lock': 'APP SPERREN',
    'dash.unlock': 'APP ENTSPERREN',
    'dash.overview': 'Übersicht',
    'dash.logs': 'Live-Aktivitätsdatenstrom',
    'dash.activeShield': 'Aktiver Datenschutzschild',
    'dash.status': 'Status',
    'dash.range': 'Signalreichweite',
    'dash.meters': 'Meter',
    'dash.powerLevel': 'Sendeleistung',
    'dash.registered': 'Registrierte Tags',
    'dash.recentDetections': 'Kamera-Erkennungen',
    'dash.noiseStatus': 'Störsignalpegel',

    // Audit Report
    'audit.builderTitle': 'Berichts-Builder',
    'audit.builderDesc': 'Generieren Sie einen sicherheitskonformen Beweisbericht',
    'audit.metricsTitle': 'Compliance-Kennzahlen',
    'audit.metricsDesc': 'Zielgerichtete Verpixelungs-Erfolgsraten über wichtige CDNs',
    'audit.typeNamePlaceholder': 'Name eingeben (z. B. Agent 42A)',
    'audit.signInstruction': 'Auf der Linie mit der Maus oder dem Finger unterschreiben',
    'audit.clearSignature': 'Unterschrift löschen',
    'audit.simulateIncident': 'Vorfall simulieren',

    // Global
    'global.save': 'Speichern',
    'global.cancel': 'Abbrechen',
    'global.enabled': 'Aktiviert',
    'global.disabled': 'Deaktiviert',
    'global.loading': 'Laden...',
    'global.active': 'Aktiv',
    'global.inactive': 'Inaktiv'
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('blurbubble_language');
      if (saved === 'en' || saved === 'fr' || saved === 'de') {
        return saved;
      }
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('blurbubble_language', lang);
    } catch (e) {}
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations['en'];
    let text = langDict[key] || translations['en'][key] || key;
    
    if (variables) {
      Object.entries(variables).forEach(([name, value]) => {
        text = text.replace(new RegExp(`{${name}}`, 'g'), String(value));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
