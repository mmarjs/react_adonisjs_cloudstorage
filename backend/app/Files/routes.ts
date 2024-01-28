import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('zip_build/:link', 'FilesController.zipOutput').as('get_zip_build_output')
  Route.post('download_file', 'FilesController.singleDownload').as('download_single_file')
  Route.post('build_zip', 'FilesController.buildZip').as('build_zip_file')
  Route.post('create', 'FilesController.createFiles').as('create_upload_files')
  Route.post('delete_trash', 'FilesController.deleteFiles').as('file_delete_trash')
})
  .prefix('files')
  .middleware(['auth'])
  .namespace('App/Files')
