export interface MeasurementField {
    id: string;
    name: string;
    value: string;
}

export interface BiometricPrefs {
    [authType: number]: boolean;
}

export interface BiometricInfo {
    name: string;
    description: string;
    icon: string;
}