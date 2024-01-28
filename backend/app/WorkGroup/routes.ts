import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('directory', 'WorkGroupFolderController.directory').as('workgroup_folder_directory')
    Route.post('create', 'WorkGroupFolderController.create').as('workgroup_folder_create')
    Route.post('move', 'WorkGroupFolderController.move').as('workgroup_folder_move')
    Route.post('rename', 'WorkGroupFolderController.rename').as('workgroup_folder_rename')
    Route.put('update', 'WorkGroupFolderController.update').as('workgroup_folder_update')
  }).prefix('folder')

  Route.group(() => {
    Route.get('view/:folder_id/:status/:page/:limit', 'WorkGroupFileController.view').as(
      'workgroup_file_view'
    )
    Route.post('move', 'WorkGroupFileController.move').as('workgroup_file_move')
    Route.post('rename', 'WorkGroupFileController.rename').as('workgroup_file_rename')
    Route.put('update', 'WorkGroupFileController.update').as('workgroup_file_update')
  }).prefix('file')
})
  .prefix('workgroup')
  .middleware(['auth'])
  .namespace('App/WorkGroup')
