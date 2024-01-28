import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App/App'
import * as serviceWorker from './serviceWorker'
import { ErrorPage } from 'App/ErrorPages'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from 'App/store'
import { ThemeProvider } from '@material-ui/core/styles'
import theme from 'App/theme'
import { SnackbarProvider } from 'notistack'
import { askForNotificationPermission } from 'Lib/notification'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { sampleRate, isProduction } from 'Lib'
import { QueryClientProvider, QueryClient } from 'react-query'
import { HelmetProvider } from 'react-helmet-async'
import { CompatablityCheck } from 'App/CompatabilityCheck'
import { LogRocketProvider } from 'Lib/LogRocketProvider'
import LogRocket from 'logrocket'
import setupLogRocketReact from 'logrocket-react'
import { StatusProvider } from 'App/StatusProvider'

const logRocketId: string = process.env.REACT_APP_LOGROCKET_ID as string

if (isProduction) {
  LogRocket.init(logRocketId)
  setupLogRocketReact(LogRocket)
}

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: sampleRate(),
  environment: process.env.NODE_ENV,
})

if (isProduction) {
  LogRocket.getSessionURL((sessionURL) => {
    Sentry.configureScope((scope) => {
      scope.setExtra('sessionURL', sessionURL)
    })
  })
}

askForNotificationPermission()

if (window.hasOwnProperty('Sentry')) {
  if (process.env.NODE_ENV !== 'production') {
    //@ts-ignore
    window.store = store
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={() => <ErrorPage />}>
      <CompatablityCheck>
        <LogRocketProvider logrocket={LogRocket}>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <HelmetProvider>
                <ThemeProvider theme={theme}>
                  <SnackbarProvider autoHideDuration={5000} maxSnack={3}>
                    <QueryClientProvider client={queryClient}>
                      <StatusProvider>
                        <App />
                      </StatusProvider>
                    </QueryClientProvider>
                  </SnackbarProvider>
                </ThemeProvider>
              </HelmetProvider>
            </PersistGate>
          </ReduxProvider>
        </LogRocketProvider>
      </CompatablityCheck>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()
