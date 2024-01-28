import React, { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Data */
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

/** Material UI */
import { useTheme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import makeStyles from '@material-ui/core/styles/makeStyles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'

/** UI */
import { GuestHeader, UserHeader, ShareHeader } from 'UI/Layout/Header'
import { DesktopDrawer, MobileDrawer } from 'UI/Layout/Drawer'
import { WorkspaceTemplate } from 'UI/Layout/Template'
import { IconTitle } from 'UI/Components'

interface Props {
  children: ReactNode
}

export function Layout(props: Props) {
  const location = useLocation()
  const theme = useTheme()
  const isXsWidth = useMediaQuery(theme.breakpoints.down('xs'))
  const isSmWidth = useMediaQuery(theme.breakpoints.down('sm'))
  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  const open = useSelector((state: AppState) => state.sidebar.open)
  const fixed = useSelector((state: AppState) => state.sidebar.fixed)
  const caseData = useSelector((state: AppState) => state.workspaceData.caseData)
  const shareLoggedIn = useSelector((state: AppState) => state.share.loggedIn)

  const calculateSidebarWidth = (): string => {
    if (!loggedIn) {
      return '0px'
    }

    if (isXsWidth || isSmWidth) {
      return '0px'
    }

    if (!fixed && !open) {
      return '73px'
    }

    if (fixed && open) {
      return '240px'
    }

    // Default not open width
    return '73px'
  }

  const sidebarWidth = calculateSidebarWidth()

  const useStyles = makeStyles((theme) => ({
    mainGrid: {
      'display': 'grid',
      'grid-template-columns': `${sidebarWidth} 1fr`,
      'grid-template-rows': '1fr',
      'gap': '0px 0px',
      'grid-template-areas': `
      "sidebar app"
      `,
      'width': '100vw',
    },
    shareMainGrid: {
      'display': 'grid',
      'grid-template-columns': '1fr',
      'grid-template-rows': '1fr',
      'gap': '0px 0px',
      'grid-template-areas': `
      "sidebar app"
      `,
      'width': '100vw',
    },
    mainContent: {
      height: '100vh',
    },
    sidebar: {
      'grid-area': 'sidebar',
    },
    app: {
      'grid-area': 'app',
      'width': '100%',
    },
    appAssignedUser: {
      'height': '100vh',
      'background': '#ffffff',
      'grid-area': 'app',
      'width': '100%',
    },
    appSpacing: {
      margin: '5px 0 0 0',
    },
    infoIcon: {
      'fontSize': `28px`,
      'textAnchor': 'middle',
      'dominantBaseline': 'middle',
      '& > *': {
        fill: `#4c5964`,
      },
    },
  }))
  const classes = useStyles()
  const Title = (title: string) => (
    <IconTitle Icon={() => <BusinessCenterIcon className={classes.infoIcon} />} text={title} />
  )

  if (location.pathname.includes('workspace')) {
    return (
      <main id="main" className={classes.mainContent}>
        <WorkspaceTemplate title="Workspace" TitleComponent={() => Title(caseData['case_name'])}>
          {props.children}
        </WorkspaceTemplate>
      </main>
    )
  } else if (location.pathname.includes('share')) {
    return (
      <main id="main" className={classes.shareMainGrid}>
        <section id="main_app" className={classes.app}>
          <AppBar position="static">{shareLoggedIn ? <ShareHeader /> : <GuestHeader />}</AppBar>
          <div className={classes.appSpacing}>{props.children}</div>
        </section>
      </main>
    )
  } else {
    return (
      <main id="main" className={classes.mainGrid}>
        <section id="sidebar" className={classes.sidebar}>
          {isXsWidth ? <MobileDrawer /> : <DesktopDrawer />}
        </section>

        <section id="main_app" className={classes.app}>
          {loggedIn ? (
            <>
              <AppBar position="static">
                <UserHeader />
              </AppBar>
              <div className={classes.appSpacing}>{props.children}</div>
            </>
          ) : (
            <>
              <AppBar position="static">
                <GuestHeader />
              </AppBar>
              <div className={classes.appSpacing}>{props.children}</div>
            </>
          )}
        </section>
      </main>
    )
  }
}
