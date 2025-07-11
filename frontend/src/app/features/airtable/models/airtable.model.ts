export interface IAirtableAuthResponse {
  connectedAt: string;
  isConnected: boolean;
  email: string;
}
export interface IUserAuth {
  isConnected: boolean;
  isLoading: boolean;
  email: string;
  connectedAt: Date | null;
  errorMessage: string;
}

export interface ISyncStatus {
  isSyncing: boolean;
  message: string;
  stats?: Record<string, number>;
}
