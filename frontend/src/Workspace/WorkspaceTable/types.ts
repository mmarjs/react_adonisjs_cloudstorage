export interface NoResultProps {
  isLoader?: boolean
  searchMode: boolean
}

interface SelectedRowCountItem {
  id: number
  access: string
  data_id: number
  expanded: boolean
  hasChild: boolean
  icon: string
  modifiedDate: string
  mane: string
  notes: string
  owner: string
  parent_id: number
  path: string
  seleced: boolean
  size: number
  tooltip: string
  type: string
}

export interface FooterStatuItemProps {
  selectedRows: SelectedRowCountItem[]
  sizeMode: boolean
}
