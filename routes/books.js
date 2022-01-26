/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
const express = require('express')
const { redirect } = require('express/lib/response')
const Author = require('../models/author')
const Book = require('../models/book')

const router = express.Router()

const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/jpg'
]

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    // regex take action on 'title' from database
    // 'i' ignore capital letter
    query = query.regex(
      'title',
      new RegExp(req.query.title, 'i')
    )
  }
  if (
    req.query.publishedBefore != null
    && req.query.publishedBefore != ''
  ) {
    query = query.lte(
      'publishDate',
      req.query.publishedBefore
    )
  }
  if (
    req.query.publishedAfter != null
    && req.query.publishedAfter != ''
  ) {
    query = query.gte(
      'publishDate',
      req.query.publishedAfter
    )
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderFormPage(res, new Book(), 'new')
})

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    authorId: req.body.authorId,
    // transform String to Date
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })

  // Save encoded JSON cover in book
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  } catch {
    renderFormPage(res, book, 'new', true)
  }
})

// Show book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('authorId')
      .exec()
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderFormPage(res, book, 'edit')
  } catch {
    res.redirect('/')
  }
})

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form == 'edit') {
        params.errorMessage = 'Error updating book'
      } else {
        params.errorMessage = 'Error creating book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

// Update Book Route
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.authorId = req.body.authorId
    // transform String to Date
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover != '') {
      // Save encoded JSON cover in book
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderFormPage(res, book, 'edit', true)
    } else {
      redirect('/')
    }
  }
})

// Delete book page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  // decode data to JSON object
  const cover = JSON.parse(coverEncoded)
  // if we have cover & is image
  if (
    cover != null
    && imageMimeTypes.includes(cover.type)
  ) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router