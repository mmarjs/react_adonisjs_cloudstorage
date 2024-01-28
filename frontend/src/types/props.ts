export interface ActionMenuProps {
  MenuItems?: (props: ActionMenuItemsProps) => JSX.Element
}

export interface ActionMenuItemsProps {
  navigate: (url: string) => void
}

export interface BreadCrumbLink {
  name: string
  href: string
}

export interface TemplateProps {
  title: string
  TitleComponent?: () => JSX.Element
  children: React.ReactNode
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  desktopOnly?: boolean
  breadcrumbs?: BreadCrumbLink[]
  FilterItems?: () => JSX.Element
  MenuItems?: (props: MenuItemProps) => JSX.Element
  onChangeViewMode?: (ev: React.ChangeEvent<HTMLInputElement>) => void
  onSimpleSearchChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void
  onSimpleClearSearch?: () => void
}

export interface SearchBoxProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
  FilterItems?: () => JSX.Element
}

export interface MenuItemProps {
  navigate: (url: string) => void
}

export interface CombinedMenuProps {
  showAdminMenu: boolean
  showEnterpriseMenu: boolean
}

export interface ViewerTemplateProps {
  title: string
  children: React.ReactNode
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  desktopOnly?: boolean
  TitleComponent?: () => JSX.Element
}

export interface WorkspaceTemplateProps {
  title: string
  children: React.ReactNode
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  desktopOnly?: boolean
  TitleComponent?: () => JSX.Element
}

export interface DesktopCheckProps {
  title: string
}

export interface ViewerSidebarProps {
  isCollapse: Boolean
  handleCollapse: (collapse: boolean) => void
}

export interface ViewerDetailProps {
  handleDetailCollapse: (collapse: boolean) => void
}

export interface FieldMenuProps {
  FieldItems: (props: FieldMenuItemProps) => JSX.Element
  fieldItemList: FieldItemList[]
}

export interface FieldMenuItemProps {
  fieldItemList: FieldItemList[]
}

export interface FieldItemList {
  id: string
  numeric: boolean
  disablePadding: boolean
  label: string
  checked: boolean
}

export interface DetailModalProps {
  isOpen: boolean
  handleOpen: (open: boolean) => void
  detailData?: any
}

export interface RenameModalProps {
  onSetCreateName: (newName: string) => void
  onSetRenameName: (newName: string) => void
  onCloseModal: () => void
  open: boolean
  currentName: string
  isAddFolder: boolean
  subDataList: any
}

export interface ContextMenuProps {
  onChangeMenu: (arg: any) => void
  anchor: string
  contextMenuItem: any
}

export interface WorkspaceShareFormProps {
  formType: 'upload' | 'download' | 'share'
  resourceData: any
  identifier: string
  setResetLink: () => void
  closeShareForm: () => void
  openErrorMessage: (message: string) => void
}

export interface SecureFormProps {
  openModal: boolean
  onCloseModal: () => void
}

export interface WorkspaceAdvancedSearchProps {
  onError: (errorTitle: string) => void
}

export interface ViewModeSwitchProps {
  onChangeViewMode: (ev: React.ChangeEvent<HTMLInputElement>) => void
}

export interface SimpleSearchProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
}

export interface CaseTableViewProps {
  dataColumns: any
  rowData: any
}
