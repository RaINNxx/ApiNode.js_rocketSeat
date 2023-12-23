exports.up = knex => knex.schema.createTable('links', table => {
    table.increments('id')
    table.text('url').notNullabel

   table.integer('note_id').references('id').inTable('notes').onDelete('CASCADE')

 })
   
 exports.down =  knex => knex.schema.dropTable('links')
 