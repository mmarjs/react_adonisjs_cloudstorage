import Route from '@ioc:Adonis/Core/Route'

Route.get('share/link_status/:link', 'ShareLinkController.status')
  .namespace('App/Share')
  .as('get_share_link_status')

Route.group(() => {
  Route.get('fetch_shared_links', 'ShareLinkController.fetch').as('share_fetch_shared_links')
  Route.get('data/:link', 'ShareLinkController.getData').as('get_share_link_data')
  Route.post('create_link', 'ShareLinkController.create').as('create_share_link')
  Route.put('update_link/:id', 'ShareLinkController.update').as('update_share_link')
  Route.delete('delete_link/:id', 'ShareLinkController.delete').as('delete_share_link')
})
  .prefix('share')
  .middleware(['auth'])
  .namespace('App/Share')
