import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    intermediate: Palette['primary']
    archived: Palette['primary']
    progress: Palette['primary']
    blue: Palette['primary']
    danger: Palette['primary']
    green: Palette['primary']
  }

  interface PaletteOptions {
    intermediate: PaletteOptions['primary']
    archived: PaletteOptions['primary']
    progress: PaletteOptions['primary']
    blue: PaletteOptions['primary']
    danger: PaletteOptions['primary']
    green: PaletteOptions['primary']
  }
}

export const primary = '#5FB158'
const secondary = '#4472C4'
const intermediate = '#404040'
const brandGreen = '#5FB158'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: `${primary}`,
    },
    secondary: {
      light: '#6194c9',
      main: `${secondary}`,
      dark: '#0e56a1',
    },
    intermediate: {
      main: `${intermediate}`,
    },
    archived: {
      main: '#797979',
    },
    progress: {
      main: '#FFC003',
    },
    blue: {
      main: '#4472C4',
    },
    danger: {
      main: '#dc3545',
    },
    green: {
      main: brandGreen,
    },
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        hr: {
          border: 'none',
          backgroundColor: `${primary}`,
          height: '1px',
          margin: '1rem 0',
        },
        a: {
          'fontSize': '0.9rem',
          'fontWeight': 600,
          'color': '#4472C4',
          'textDecoration': 'none !important',
          'cursor': 'pointer',
          '&:visited': {
            color: '#4472C4',
            textDecoration: 'none !important',
          },
        },
        form: {
          width: '100%',
        },
      },
    },
    MuiButton: {
      text: {
        color: 'white',
        height: 48,
        borderRadius: 3,
        padding: '0 30px',
      },
      containedPrimary: {
        color: '#ffffff',
      },
    },
    MuiTypography: {
      body1: {
        color: '#52525C',
        fontSize: '1rem',
      },
      h1: {
        fontSize: '1.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.3rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.2rem',
        fontWeight: 600,
      },
    },
    MuiInputLabel: {
      root: {
        fontSize: '0.9rem',
        fontWeight: 600,
        margin: '0',
      },
    },
    MuiListItemText: {
      root: {
        fontSize: '0.8rem',
      },
      primary: {
        fontSize: '0.8rem',
      },
    },
    MuiFormGroup: {
      root: {
        margin: '0 0 1rem 0',
      },
    },
    MuiBreadcrumbs: {
      root: {
        margin: '1rem 0 0 0',
      },
    },
    MuiOutlinedInput: {
      root: {
        // height: '2.5rem',
      },
    },
    MuiTableCell: {
      stickyHeader: {
        backgroundColor: `${primary}`,
      },
    },
  },
})

export default theme
