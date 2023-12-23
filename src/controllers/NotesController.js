const knex = require('../database/knex')

class NotesController {
  // Método assíncrono para criar uma nova nota com títulos, descrição, tags e links.
  async create(request, response) {
    const { title, description, tags, links } = request.body
    const { user_id } = request.params

    // Inserção dos dados principais da nota na tabela 'notes'.
    const [note_id] = await knex('notes').insert({
      title,
      description,
      user_id
    })

    // Mapeamento dos links para serem inseridos na tabela 'links'.
    const linksInsert = links.map(link => {
      return {
        note_id,
        url: link
      }
    })

    // Inserção dos links na tabela 'links'.
    await knex('links').insert(linksInsert)

    // Mapeamento das tags para serem inseridas na tabela 'tags'.
    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    // Inserção das tags na tabela 'tags'.
    await knex('tags').insert(tagsInsert)

    // Resposta JSON indicando sucesso na criação da nota.
    response.json()
  }

  // Método assíncrono para buscar e exibir uma nota específica com suas tags e links.
  async show(request, response) {
    const { id } = request.params

    // Busca da nota na tabela 'notes'.
    const note = await knex('notes').where({ id }).first()
    // Busca das tags relacionadas à nota na tabela 'tags'.
    const tags = await knex('tags').where({ note_id: id }).orderBy('name')
    // Busca dos links relacionados à nota na tabela 'links'.
    const links = await knex('links').where({ note_id: id }).orderBy('created_at')

    // Resposta JSON contendo os detalhes da nota, suas tags e links.
    return response.json({
      ...note,
      tags,
      links
    })
  }

  // Método assíncrono para deletar uma nota específica.
  async delete(request, response) {
    const { id } = request.params

    // Deleção da nota na tabela 'notes'.
    await knex('notes').where({ id }).delete()

    // Resposta JSON indicando sucesso na deleção da nota.
    return response.json()
  }

  // Método assíncrono para buscar e retornar notas com base em filtros.
  async index(request, response) {
    const { title, user_id, tags } = request.query

    let notes

    // Verificação se há filtros de tags.
    if (tags) {
      // Divisão e formatação das tags recebidas.
      const filterTags = tags.split(',').map(tag => tag.trim())

      // Busca das notas com base nos filtros de tags.
      notes = await knex('tags')
        .select([
          'notes.id',
          'notes.title',
          'notes.user_id',
        ])
        .where('notes.user_id', user_id)
        .whereLike('notes.title', `%${title}%`)
        .whereIn('name', filterTags)
        .innerJoin('notes', 'notes.id', 'tags.note_id')
        .orderBy('notes.title')
        
    } else {
      // Busca das notas sem filtros de tags.
      notes = await knex('notes')
        .where({ user_id })
        .whereLike('title', `%${title}%`)
        .orderBy('title')
    }

    // Busca das tags do usuário.
    const userTags = await knex('tags').where({ user_id })
    
    // Mapeamento das notas com suas tags.
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })

    // Resposta JSON contendo as notas com suas tags.
    return response.json(notesWithTags)
  }
}

module.exports = NotesController
