import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

/** Data */
import { useSelector } from 'react-redux'

import { DashboardPage } from 'Dashboard'
import { Layout } from 'UI'
import { NotFound, UnderDevelopment } from 'App/ErrorPages'
import { AddCase, ManageCases, EditCase, AssignedUsers } from 'Cases'
import { AppState } from 'App/reducers'
import { ExpiryGuard, WORKSPACE_URL } from 'Lib'

/**
 * Auth Pages
 */

import { Register, Login, Logout, VerifyAccount, ResetPassword, RequestReset } from 'Auth'

/**
 * User Pages
 */
import {
  Overview,
  Preferences,
  PersonalInfo,
  NameForm,
  PhoneForm,
  AddressForm,
  Security,
  EmailForm,
  PasswordForm,
  UserTwoFactorForm,
  SwitchAccounts,
} from 'Users/Profile'

import { ManageUsers } from 'Users'
/**
 * Account Pages
 */
import {
  AcceptInvitation,
  AccountActivityHistory,
  AccountBillingInfo,
  ManageAccount,
} from 'Account'

/**
 * Enterprise Pages
 */
import {
  EnterpriseDashboard,
  EnterpriseAccountOwners,
  EnterpriseAccountActivities,
  EnterpriseBillingInfo,
  EnterpriseCaseManagement,
  EnterpriseCustomize,
  ManageEnterpriseUsers,
} from 'Enterprise'

import { SelectEvidence } from 'Evidence'
import { AddCreditCard } from 'Billing'
import { ManageActiveLocker, ManageArchiveLocker } from 'Locker'

import { WorkspaceGrid } from 'Workspace'
import { ShareLogin } from 'Workspace/Share/Login/ShareLogin'
import { ShareIndex } from 'Workspace/Share/Pages/ShareIndex'
import { SharePasswordForm } from 'Workspace/Share/Login/SharePasswordForm'

/**
 * Auth Urls
 */
import {
  HOME_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTRATION_URL,
  REQUEST_RESET_URL,
  RESET_PASSWORD_URL,
  VERIFY_ACCOUNT_URL,
} from 'Lib'

/**
 * User Urls
 */
import {
  USER_OVERVIEW_URL,
  USER_PERSONAL_INFO_URL,
  USER_NAME_FORM_URL,
  USER_PHONE_FORM_URL,
  USER_ADDRESS_FORM_URL,
  USER_PREFERENCES_URL,
  USER_SECURITY_URL,
  USER_EMAIL_FORM_URL,
  USER_PASSWORD_FORM_URL,
  USER_TWO_FACTOR_FORM_URL,
  SWITCH_ACCOUNTS_URL,
} from 'Lib'

/**
 * Account Urls
 */

import {
  ACCEPT_INVITATION_URL,
  ACCOUNT_ACTIVITY_HISTORY_URL,
  ACCOUNT_BILLING_URL,
  ACCOUNT_MANAGE_USERS_URL,
  MANAGE_ACCOUNT_URL,
  ADD_CREDIT_CARD_URL,
} from 'Lib'

/**
 * Case Urls
 *
 */
import { ADD_CASE_URL, MANAGE_CASES_URL, CASE_URL, ASSIGNED_USERS } from 'Lib'

/**
 * Acquisition Urls
 */

import { SELECT_EVIDENCE_URL, MANAGE_ACTIVE_LOCKER, MANAGE_ARCHIVE_LOCKER } from 'Lib'

/**
 * Enterprise Urls
 */
import {
  ENTERPRISE_DASHBOARD_URL,
  ENTERPRISE_ACCOUNT_OWNERS_URL,
  ENTERPRISE_CASE_MANAGEMENT_URL,
  ENTERPRISE_MANAGE_USERS_URL,
  ENTERPRISE_ACTIVITY_HISTORY_URL,
  ENTERPRISE_CUSTOMIZE_URL,
  ENTERPRISE_BILLING_URL,
} from 'Lib'

/**


/**
 * Share Urls
 */
import { SHARE_LOGIN_URL, SHARE_SECURE_URL, SHARE_USER_PASSWORD_FORM_URL } from 'Lib'

/**
 * Error Urls
 */
import { UNDER_DEVELOPMENT } from 'Lib'

export interface GuardedRoute {
  path: string
  exact?: boolean
  component: React.FunctionComponent
}

function GuardedShare(props: GuardedRoute) {
  const { path, exact, component } = props

  const loggedIn = useSelector((state: AppState) => state.share.loggedIn)
  const link = useSelector((state: AppState) => state.share.shareLink?.link)

  if (loggedIn === false) {
    return <Redirect to={`${SHARE_LOGIN_URL}/${link}`} />
  }

  return (
    <ExpiryGuard gate="share">
      <Route path={path} exact={exact} component={component} />
    </ExpiryGuard>
  )
}

function Guarded(props: GuardedRoute) {
  const { path, exact, component } = props
  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  if (loggedIn === false) {
    return <Redirect to={LOGIN_URL} />
  }
  if (['/custodians', '/active_locker', '/archive_locker'].indexOf(path) !== -1) {
    return <Redirect to={UNDER_DEVELOPMENT} />
  }

  return (
    <ExpiryGuard gate="main">
      <Route path={path} exact={exact} component={component} />
    </ExpiryGuard>
  )
}

export function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Route>
          <Switch>
            {/* Auth Routes */}
            <Route path={LOGIN_URL} exact component={Login} />
            <Route path={LOGOUT_URL} exact component={Logout} />
            <Route path={REGISTRATION_URL} exact component={Register} />
            <Route path={REQUEST_RESET_URL} exact component={RequestReset} />
            <Route path={VERIFY_ACCOUNT_URL + '/:token'} exact component={VerifyAccount} />
            <Route path={RESET_PASSWORD_URL + '/:token'} exact component={ResetPassword} />

            {/* Invitation */}
            <Route path={ACCEPT_INVITATION_URL + '/:code'} exact component={AcceptInvitation} />
            <Guarded path={UNDER_DEVELOPMENT} component={UnderDevelopment} />

            <Guarded path={HOME_URL} exact component={DashboardPage} />

            {/* Account Routes */}
            <Guarded path={ACCOUNT_ACTIVITY_HISTORY_URL} exact component={AccountActivityHistory} />
            <Guarded path={ACCOUNT_BILLING_URL} exact component={AccountBillingInfo} />
            <Guarded path={ACCOUNT_MANAGE_USERS_URL} exact component={ManageUsers} />
            <Guarded path={ADD_CREDIT_CARD_URL} exact component={AddCreditCard} />
            <Guarded path={MANAGE_ACCOUNT_URL} exact component={ManageAccount} />

            {/* Enterprise Routes */}
            <Guarded path={ENTERPRISE_DASHBOARD_URL} exact component={EnterpriseDashboard} />
            <Guarded
              path={ENTERPRISE_ACCOUNT_OWNERS_URL}
              exact
              component={EnterpriseAccountOwners}
            />
            <Guarded
              path={ENTERPRISE_CASE_MANAGEMENT_URL}
              exact
              component={EnterpriseCaseManagement}
            />
            <Guarded path={ENTERPRISE_MANAGE_USERS_URL} exact component={ManageEnterpriseUsers} />
            <Guarded path={ENTERPRISE_BILLING_URL} exact component={EnterpriseBillingInfo} />
            <Guarded
              path={ENTERPRISE_ACTIVITY_HISTORY_URL}
              exact
              component={EnterpriseAccountActivities}
            />
            <Guarded path={ENTERPRISE_CUSTOMIZE_URL} exact component={EnterpriseCustomize} />

            {/* Evidence */}
            <Guarded path={SELECT_EVIDENCE_URL + '/:case_id'} exact component={SelectEvidence} />

            {/* Case Routes */}

            <Guarded path={MANAGE_CASES_URL} exact component={ManageCases} />
            <Guarded path={ADD_CASE_URL} exact component={AddCase} />
            <Guarded path={`${CASE_URL}/:case_id/edit`} exact component={EditCase} />
            <Guarded path={`${ASSIGNED_USERS}/:case_id`} exact component={AssignedUsers} />

            {/* Locker Routes */}
            <Guarded path={MANAGE_ACTIVE_LOCKER} exact component={ManageActiveLocker} />
            <Guarded path={MANAGE_ARCHIVE_LOCKER} exact component={ManageArchiveLocker} />

            {/* User Routes */}
            <Guarded path={USER_PERSONAL_INFO_URL} exact component={PersonalInfo} />
            <Guarded path={USER_NAME_FORM_URL} exact component={NameForm} />
            <Guarded path={USER_PHONE_FORM_URL} exact component={PhoneForm} />
            <Guarded path={USER_ADDRESS_FORM_URL} exact component={AddressForm} />
            <Guarded path={USER_PREFERENCES_URL} exact component={Preferences} />
            <Guarded path={USER_OVERVIEW_URL} exact component={Overview} />
            <Guarded path={USER_SECURITY_URL} exact component={Security} />
            <Guarded path={USER_EMAIL_FORM_URL} exact component={EmailForm} />
            <Guarded path={USER_PASSWORD_FORM_URL} exact component={PasswordForm} />
            <Guarded path={USER_TWO_FACTOR_FORM_URL} exact component={UserTwoFactorForm} />
            <Guarded path={SWITCH_ACCOUNTS_URL} exact component={SwitchAccounts} />

            {/* Workspace Routes */}

            <Guarded path={WORKSPACE_URL} component={WorkspaceGrid} />

            {/* Share Routes */}

            <Route path={SHARE_LOGIN_URL + '/:link'} exact component={ShareLogin} />
            <GuardedShare path={SHARE_SECURE_URL} exact component={ShareIndex} />
            <GuardedShare path={SHARE_USER_PASSWORD_FORM_URL} exact component={SharePasswordForm} />

            <Route path="*" component={NotFound} />
          </Switch>
        </Route>
      </Layout>
    </BrowserRouter>
  )
}
