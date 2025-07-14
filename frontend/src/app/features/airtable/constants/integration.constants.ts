// Enum-like constant for integration types
export const INTEGRATION = {
  AIRTABLE: 'Airtable'
} as const;

export type IntegrationType = typeof INTEGRATION[keyof typeof INTEGRATION];

// Interface for dropdown or metadata usage
export interface IntegrationOption {
  value: IntegrationType;
  label: string;
}

// Integration list with value + label
export const INTEGRATIONS: IntegrationOption[] = [
  { value: INTEGRATION.AIRTABLE, label: 'Airtable' }
];
