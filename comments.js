// Create we server

// Import express
const express = require('express');
const router = express.Router();

// Import model
const Comment = require('../models/Comment');

// Import middleware
const auth = require('../middleware/auth');

// Import validator
const { check, validationResult } = require('express-validator');

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
);

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
    check('post', 'Post is required').not().isEmpty()
]], async (req, res) => {
    // Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    // Get data from body
    const { text, post } = req.body;

    try {
        // Create new comment
        const newComment = new Comment({
            text,
            post,
            user: req.user.id
        });

        // Save comment
        const comment = await newComment.save();

        // Response
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
);

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
    // Get data from body
    const { text } = req.body;

    // Build comment object
    const commentFields = {};
    if (text) commentFields.text = text;

    try {
        // Find comment by id
        let comment = await Comment.findById(req.params.id);

        // Check if comment exists
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        // Check if user owns comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Update comment
        comment = await Comment.findByIdAndUpdate(req.params.id, { $set: commentFields }, { new: true });

        // Response
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
);













