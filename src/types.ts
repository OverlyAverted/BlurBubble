export type PrivacyLevel = 'strict_blur' | 'pixelate' | 'emoji' | 'black_bar' | 'magic_removal' | 'none';

export interface RegisteredEntity {
  id: string;
  name: string;
  type: 'phone' | 'smart_tag' | 'key_fob' | 'airtag' | 'galaxy_tag' | 'valuable' | 'artwork' | 'building' | 'prototype';
  isActive: boolean;
  privacyLevel: PrivacyLevel;
  signalStrength?: number;
  batteryPercent: number;
  acousticWatermarkingEnabled?: boolean;
  ultrasonicMicSaturationEnabled?: boolean;
  vocalScramblerEnabled?: boolean;
}

export interface FaceRecord {
  id: string;
  name: string;
  photoUrl: string; // we can use placeholder or uploaded images
  isRegistered: boolean;
  confidenceScore: number;
}

export interface CitizenState {
  isBroadcasting: boolean;
  privacyLevel: PrivacyLevel;
  rangeMeters: number;
  anonymousId: string;
  facialRecognitionOptOut: boolean;
  dataRetentionPref: 'zero_retention' | 'encrypted_cache' | 'bystander_anonymous';
  registeredEntities: RegisteredEntity[];
  registeredFaces: FaceRecord[];
  socialProfile?: {
    username: string;
    bio: string;
    interests: string[];
    link: string;
  };
  overrideActive?: boolean;
  emergencyPrivacyActive?: boolean;
  enablePhoneBuzz?: boolean;
  enablePushNotifications?: boolean;
  notifyOnChildEngaged?: boolean;
  notifyOnVideoFound?: boolean;
  notifyOnVideoDeleted?: boolean;
  theme?: 'stealth' | 'visibility';
  disguiseUiActive?: boolean;
  disguiseType?: 'transit_route';
  hardwareLicenses?: HardwareLicense[];
  smartSchedulingEnabled?: boolean;
  scheduleSlots?: ScheduleSlot[];
  wifiRulesEnabled?: boolean;
  wifiRules?: WifiTriggerRule[];
  currentWifiSsid?: string;
  biometricLockEnabled?: boolean;
  biometricRegistered?: boolean;
  biometricEnrollmentDate?: string;
  biometricRelyingParty?: string;
  biometricCredentialId?: string;
  batterySaverActive?: boolean;
  intelligentBatteryOptimization?: boolean;
  familyShieldSync?: boolean;
  familyShieldSyncStatus?: 'synchronized' | 'pending' | 'disabled';
  governanceHierarchy?: string[];
  totalLockdownMode?: boolean;
  hierarchyRulesEnabled?: boolean;
  showMetricsBar?: boolean;
  showControlBar?: boolean;
  showAuditLogs?: boolean;
  showEmergencyButton?: boolean;
  showGuideButton?: boolean;
  showTopBar?: boolean;
  showSignalHistory?: boolean;
  showThreatOptimizer?: boolean;
  showPrivacyImpactScore?: boolean;
  showBatteryWidget?: boolean;
  showSignalMap?: boolean;
  notificationSound?: 'sonar_chime' | 'tactical_click' | 'silent_glow';
  notificationMinDistance?: number;
  notificationShowDistance?: boolean;
  notificationShowModel?: boolean;
  notificationSoundVolume?: number;
  irDisruptionEnabled?: boolean;
  lidarInterferenceEnabled?: boolean;
  antiLipReadingEnabled?: boolean;
  acousticWatermarkingEnabled?: boolean;
  ultrasonicMicSaturationEnabled?: boolean;
  vocalScramblerEnabled?: boolean;
  lowBatteryThreshold?: number;
  enableLowBatteryNotifications?: boolean;
  targetedShieldingEnabled?: boolean;
  targetedSoundAngle?: number;
  targetedPeripheralConnected?: boolean;
  targetedSoundIntensity?: number;
  adversarialPoisoning?: boolean;
  decoyPersonaBroadcast?: boolean;
  rfc9402SocialBlock?: boolean;
  regulatoryCeaseAndDesist?: boolean;
  mobileCamsBlock?: boolean;
  cctvBlock?: boolean;
  smartHomeExclusion?: boolean;
  aerialDroneDisruption?: boolean;
  gptBotExclusion?: boolean;
  googleExtendedBlock?: boolean;
  anthropicBlock?: boolean;
  commonCrawlOptOut?: boolean;
  dataBrokersSweep?: boolean;
  showWarpGrid?: boolean;
  autoCalibrate?: boolean;
  showDepthHeatmap?: boolean;
  thermalPulseEnabled?: boolean;
  retroScramblerEnabled?: boolean;
  lidarMeshFloodEnabled?: boolean;
  wifi7MacOptOutEnabled?: boolean;
  auracastSquelchEnabled?: boolean;
  uwbDistanceScramblerEnabled?: boolean;
  euAiActShieldEnabled?: boolean;
  bipaDeletionEnabled?: boolean;
  rfc9402ComplianceEnabled?: boolean;
  bypassEmergencyConfirm?: boolean;
  hapticIntensity?: 'low' | 'medium' | 'high';
}

export interface WifiTriggerRule {
  id: string;
  ssid: string;
  label: string;
  privacyLevel: PrivacyLevel;
  broadcastEnabled: boolean;
  facialRecognitionOptOut: boolean;
  isActive: boolean;
}

export interface ScheduleSlot {
  id: string;
  label: string;
  startTime: string; // "HH:MM" 24-hour format
  endTime: string; // "HH:MM" 24-hour format
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  broadcastEnabled: boolean; // whether broadcasting is ON or OFF in this slot
  icon: 'briefcase' | 'baby' | 'beer' | 'home' | 'school' | 'car' | 'users' | 'shield';
  isActive: boolean; // whether this schedule rule is enabled
  privacyLevel?: PrivacyLevel; // optional custom privacy level override for this slot
}

export interface HardwareLicense {
  id: string;
  deviceName: string;
  serialNumber: string;
  status: 'active' | 'revoked' | 'expired' | 'pending';
  purchaseDate: string;
  expirationDate: string;
  decryptedPubKey: string;
  rfComplianceCert: string;
  certType: 'FCC' | 'CE' | 'ISED' | 'MIC' | 'VCCI';
  authorityName: string;
  lastVerified: string;
  maxRFPowerDb: number;
  frequencyRangeMhz: string;
  laboratory: string;
}

export interface Pedestrian {
  id: string;
  name: string;
  avatarSeed: string;
  isBroadcasting: boolean;
  privacyLevel: PrivacyLevel;
  isChildTag?: boolean; // indicates if it's a child tag protected entity
  parentName?: string;
  socialProfile?: {
    username: string;
    bio: string;
    interests: string[];
    link: string;
  };
  posX: number; // percentage across screen
  posY: number; // percentage down screen
  speed: number;
  direction: 'left' | 'right';
  signalStrength: number; // simulated dBm
}

export interface PerimeterSensor {
  id: string;
  name: string;
  location: string;
  type: 'school' | 'home' | 'commercial' | 'public';
  isActive: boolean;
  coverageMeters: number;
  detectionsBlocked: number;
  status: 'active' | 'tampered' | 'maintenance' | 'offline';
}

export interface WebTakedownRecord {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'web_index';
  url: string;
  confidenceScore: number;
  status: 'detected' | 'dispatched' | 'takedown_success' | 'appeal_pending';
  timestamp: string;
}

export interface EscrowKeyHolder {
  id: string;
  agency: string;
  keyStatus: 'locked' | 'escrowed' | 'emergency_accessed' | 'revoked';
  holderName: string;
  authClearance: string;
  lastUsed?: string;
}

export interface DetectionLog {
  id: string;
  timestamp: string;
  deviceModel: string;
  action: 'censored' | 'discovered' | 'ignored' | 'erased';
  shieldApplied: string;
  distance: number;
  rotatedId: string;
}
