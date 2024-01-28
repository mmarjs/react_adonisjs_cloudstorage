import { Helmet } from 'react-helmet-async'
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Link from '@material-ui/core/Link'
import { APP_NAME } from 'Lib'
import { TemplateProps } from 'types'
import { ActionMenu, Loader, SimpleSearch, ViewModeSwitch, DesktopCheck } from 'UI'

const useStyles = makeStyles((theme) => ({
  titleRow: {
    height: '50px',
  },
  multiRow: {
    minHeight: '50px',
  },
  errorRow: {
    margin: '2rem 0',
  },
  link: {
    'fontSize': '1rem',
    'fontWeight': 600,
    'color': `${theme.palette.intermediate.main}`,
    'textDecoration': 'none !important',
    'cursor': 'pointer',
    '&:visited': {
      color: `${theme.palette.intermediate.main}`,
      textDecoration: 'none !important',
    },
  },
  hr: {
    margin: '0.5rem 0 1rem 0',
  },
  menuGrid: {
    'display': 'grid',
    'grid-template-columns': '360px 50px',
    'grid-template-rows': '30px',
    'gap': '0px 0px',
    'grid-template-areas': `
    "searchbox contextmenu"
    `,
  },
  searchbox: {
    'grid-area': 'searchbox',
  },
  contextmenu: {
    'grid-area': 'contextmenu',
    'display': 'flex',
    'alignItems': 'center',
  },
  contextMenuWrapper: {
    [theme.breakpoints.down('md')]: {
      margin: '14px 0 0 0',
    },
  },
  simpleSearchbox: {
    'grid-area': 'searchbox',
    'display': 'flex',
    'justifyContent': 'flex-end',
  },
}))

export function Template(props: TemplateProps) {
  const {
    title,
    TitleComponent,
    breadcrumbs,
    isLoading,
    isError,
    errorMessage,
    desktopOnly,
    MenuItems,
    children,
    onChangeViewMode,
    onSimpleSearchChange,
    onSimpleClearSearch,
  } = props
  const classes = useStyles()

  desktopOnly && <DesktopCheck title={title} />

  return (
    <>
      <Helmet>
        <title>
          {title} | {APP_NAME}
        </title>
      </Helmet>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Container>
            <Grid container justify="center" alignItems="center" className={classes.titleRow}>
              <Grid item xs={12}>
                {TitleComponent !== undefined ? (
                  <TitleComponent />
                ) : (
                  <Typography variant="h1">{title}</Typography>
                )}
              </Grid>
            </Grid>

            <Grid container justify="center" alignItems="center" className={classes.multiRow}>
              <Grid item md={8} xs={12}>
                <Breadcrumbs maxItems={2} aria-label="breadcrumb">
                  {breadcrumbs &&
                    breadcrumbs.map((breadcrumb, index) => (
                      <Link key={index} href={breadcrumb.href} className={classes.link}>
                        {breadcrumb.name}
                      </Link>
                    ))}
                </Breadcrumbs>
              </Grid>
              <Grid item md={4} xs={12} className={classes.contextMenuWrapper}>
                <div className={classes.menuGrid}>
                  <div className={classes.simpleSearchbox}>
                    {onChangeViewMode !== undefined && (
                      <ViewModeSwitch onChangeViewMode={onChangeViewMode} />
                    )}
                    {onSimpleSearchChange !== undefined && onSimpleClearSearch !== undefined && (
                      <SimpleSearch
                        onChange={onSimpleSearchChange}
                        onClearSearch={onSimpleClearSearch}
                      />
                    )}
                  </div>
                  <div className={classes.contextmenu}>
                    <ActionMenu MenuItems={MenuItems} />
                  </div>
                </div>
              </Grid>
            </Grid>

            <Grid container justify="center" alignItems="center">
              <Grid item xs={12}>
                <hr className={classes.hr} />
              </Grid>
            </Grid>

            {isError && (
              <Grid container justify="center" alignContent="center" className={classes.errorRow}>
                <Grid item sm={9} xs={12}>
                  <Alert severity="error">{errorMessage}</Alert>
                </Grid>
              </Grid>
            )}

            {children}
          </Container>
        </>
      )}
    </>
  )
}
