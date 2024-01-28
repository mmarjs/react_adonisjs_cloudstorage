import { AxiosInstance } from 'axios'
import { ActiveFileItem } from 'types'

export async function createActiveFiles(
  params: ActiveFileItem[],
  axios: AxiosInstance
): Promise<true | string> {
  try {
    await axios.post('/files/create', params)
    return true
  } catch (err) {
    return 'Some files could not be saved'
  }
}
