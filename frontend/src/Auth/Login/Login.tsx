import React from 'react'
import useLogin from './useLogin'
import { AuthTemplate } from 'UI/Layout/Template/AuthTemplate'
import ValidateLoginForm from './ValidateLoginForm'
import TwoFactorLoginForm from './TwoFactorLoginForm'
import SelectCompanyForm from './SelectCompanyForm'

export function Login() {
  const {
    action,
    error,
    isLoading,
    selectCompany,
    storeSelectedCompany,
    companies,
    processValidateLogin,
    processNeedTwoFactor,
    processVerifyTwoFactor,
  } = useLogin()

  const showFirstForm = action === 'validate-login' || action === 'need-two-factor'

  return (
    <>
      <AuthTemplate
        title="Login"
        isLoading={isLoading}
        isError={error !== null}
        errorMessage={error ?? ''}
      >
        {showFirstForm && (
          <>
            {selectCompany ? (
              <>
                <SelectCompanyForm
                  companies={companies.current}
                  storeSelectedCompany={storeSelectedCompany}
                  processNeedTwoFactor={processNeedTwoFactor}
                />
              </>
            ) : (
              <>
                <ValidateLoginForm processValidateLogin={processValidateLogin} />
              </>
            )}
          </>
        )}
        {action === 'verify-two-factor' && (
          <TwoFactorLoginForm processVerifyTwoFactor={processVerifyTwoFactor} />
        )}
      </AuthTemplate>
    </>
  )
}
