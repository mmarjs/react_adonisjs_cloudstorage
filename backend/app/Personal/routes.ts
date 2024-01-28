import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('directory', 'PersonalFolderController.directory').as('personal_folder_directory')
    Route.post('create', 'PersonalFolderController.create').as('personal_folder_create')
    Route.post('move', 'PersonalFolderController.move').as('personal_folder_move')
    Route.post('rename', 'PersonalFolderController.rename').as('rename_personal_folder')
    Route.put('update', 'PersonalFolderController.update').as('personal_folder_update')
  }).prefix('folder')

  Route.group(() => {
    Route.get('view/:folder_id/:status/:page/:limit', 'PersonalFileController.view').as(
      'personal_file_view'
    )
    Route.post('move', 'PersonalFileController.move').as('personal_file_move')
    Route.post('rename', 'PersonalFileController.rename').as('personal_file_rename')
    Route.put('update', 'PersonalFileController.update').as('personal_file_update')
  }).prefix('file')
})
  .prefix('personal')
  .middleware(['auth'])
  .namespace('App/Personal')
