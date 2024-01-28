import React from 'react'
import { useSelector } from 'react-redux'
import { ContextMenuComponent } from '@syncfusion/ej2-react-navigations'
import { ContextMenuProps } from 'types'
import { AppState } from 'App/reducers'

export function ContextMenu(props: ContextMenuProps) {
  const { onChangeMenu, anchor, contextMenuItem } = props
  const isContextMenu = useSelector((state: AppState) => state.workspaceData.isContextMenu)
  const pending = useSelector((state: AppState) => state.workspaceData.pendingNotification)
  const contextFileType = useSelector((state: AppState) => state.workspaceData.contextFileType)
  var cMenu: any = []
  const menuclick = (arg: any) => {
    onChangeMenu(arg)
  }

  const onCloseMenu = (arg: any) => {}

  const onOpenMenu = (arg: any) => {}

  return (
    <>
      {isContextMenu && !pending.isPending && (
        <ContextMenuComponent
          ref={(scope) => (cMenu = scope)}
          id="contentmenutree"
          target={anchor}
          items={contextMenuItem}
          select={menuclick}
          onClose={onCloseMenu}
          onOpen={onOpenMenu}
          beforeOpen={() =>
            cMenu.enableItems(['Download'], contextFileType === 'file' ? true : false)
          }
        />
      )}
    </>
  )
}
