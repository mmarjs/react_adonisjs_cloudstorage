declare module 'material-ui-phone-number' {
  import { ComponentType } from 'react'
  import { TextFieldProps } from '@material-ui/core/TextField'

  export type MuiPhoneNumberProps = TextFieldProps & {
    excludeCountries?: string[]
    onlyCountries?: string[]
    preferredCountries?: string[]
    regions?: string[]
    defaultCountry?: string
    inputClass?: string
    dropdownClass?: string
    autoFormat?: boolean
    disableAreaCodes?: boolean
    disableCountryCode?: boolean
    disableDropdown?: boolean
    enableLongNumbers?: boolean
    countryCodeEditable?: boolean
  }
  const MuiPhoneNumber: ComponentType<MuiPhoneNumberProps>

  export default MuiPhoneNumber
}
