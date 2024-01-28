import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('directory/:case_id', 'WorkSpaceController.directory').as('workspace_directory')
  Route.get('recycle_bin/:case_id', 'WorkSpaceController.recycleBin').as('recycle_bin_screen')
  Route.post('search', 'WorkSpaceController.search').as('workspace_search')
})
  .prefix('workspace')
  .middleware(['auth'])
  .namespace('App/WorkSpace')
