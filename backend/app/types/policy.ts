export interface PolicyActor {
  userId: number
  companyId: number
}

export type PolicyResource = 'case' | 'user' | 'custodian' | 'evidence' | 'role'

export type PolicyAction = 'read' | 'write' | 'create' | 'trash' | 'grant'
