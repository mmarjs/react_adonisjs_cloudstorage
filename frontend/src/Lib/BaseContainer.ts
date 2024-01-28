export default class BaseContainer {
  private _isLoading: boolean = false
  private _isError: boolean = false
  private _isSuccess: boolean = false
  private _errorMessage: string = ''
  private _successMessage: string = ''

  public set isLoading(val: boolean) {
    this._isLoading = val
  }

  public get isLoading() {
    return this._isLoading
  }

  public set isError(val: boolean) {
    this._isError = val
  }

  public get isError() {
    return this._isError
  }

  public set isSuccess(val: boolean) {
    this._isSuccess = val
  }

  public get isSuccess() {
    return this._isSuccess
  }

  public set successMessage(message: string) {
    this._successMessage = message
  }

  public get successMessage() {
    return this._successMessage
  }

  public set errorMessage(message: string) {
    this._errorMessage = message
  }

  public get errorMessage() {
    return this._errorMessage
  }
}
