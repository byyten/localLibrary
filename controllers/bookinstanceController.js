const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bookinstance = require("../models/bookinstance");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
  .populate("book")
  .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_delete", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await bookinstance.findByIdAndDelete(req.params.id)
  res.redirect('/catalog/bookinstances')
});



// Display BookInstance update form on GET.populate("author").populate("genre").
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  // const bookinstance = await BookInstance.find({ _id: req.params.id} ).populate("book").exec()
  // const book = await Book.findOne({ _id: bookinstance.book}).exec()
  const [bookinstance] = await Promise.all([
    BookInstance.findById(req.params.id ).populate("book").exec(),
  ]);

  const [book] = await Promise.all([
    Book.findById(bookinstance.book).exec()
  ]);

  if (bookinstance === null) {
    // No results.
    const err = new Error("Book instance not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_form", {
    title: "Update Book Instance",
    bookinstance: bookinstance,
    selected_book: book._id,
    book_list: [book]
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [


  // Validate and sanitize fields.
  body("imprint", "Imprint must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status", "Status must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("due_back", "Date due must a valid date.")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const bookinstance = new BookInstance({
      _id: req.params.id, // This is required, or a new ID will be assigned!
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const [bookinstance] = await Promise.all([
        BookInstance.findById(req.params.id ).populate("book").exec(),
      ]);
    
      const [book] = await Promise.all([
        Book.findById(bookinstance.book).exec()
      ]);
    
      res.render("bookinstance_form", {
        title: "Update Book copy",
        book_list: [book],
        bookinstance: bookinstance,
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedBookinstance = await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {});
      // Redirect to book detail page.
      res.redirect(updatedBookinstance.url);
    }
  }),
]