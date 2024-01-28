import execa from 'execa'
import Application from '@ioc:Adonis/Core/Application'

if (Application.nodeEnvironment !== 'testing') {
  execa
    .node('ace', ['event:listen'], {
      stdio: 'inherit',
    })
    .then((val) => {
      console.log(val)
    })
}
