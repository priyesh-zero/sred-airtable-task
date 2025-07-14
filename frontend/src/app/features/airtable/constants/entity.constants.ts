export const ENTITY = {
  PROJECTS: 'Projects',
  TABLES: 'Tables',
  TICKETS: 'Tickets',
  USERS: 'Users',
  REVISION_HISTORY: 'RevisionHistory',

} as const;

export type EntityType = typeof ENTITY[keyof typeof ENTITY];

export interface EntityOption {
  value: EntityType;
  label: string;
}

// Combine values + labels into one array
export const ENTITIES: EntityOption[] = [
  { value: ENTITY.PROJECTS, label: 'Projects' },
  { value: ENTITY.TABLES, label: 'Tables' },
  { value: ENTITY.TICKETS, label: 'Tickets' },
  { value: ENTITY.REVISION_HISTORY, label: 'Revision history' },
  { value: ENTITY.USERS, label: 'Users' },
];

